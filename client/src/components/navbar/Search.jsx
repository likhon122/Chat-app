import { useEffect, useRef, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { FaTimes, FaUserCheck, FaUserPlus, FaUser } from "react-icons/fa";
import { HiMagnifyingGlass, HiSparkles } from "react-icons/hi2";
import {
  useGetFriendsQuery,
  useGetPendingFriendRequestQuery,
  useLazySearchUserQuery,
  useMakeFriendRequestNotificationMutation,
  useSendFriendRequestMutation
} from "../../app/api/api";
import { useSelector } from "react-redux";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import SingleSpinner from "../Loaders/SingleSpinner";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Search = () => {
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef(null);
  const sender = useSelector((state) => state.auth?.user?._id);
  const userData = useSelector((state) => state.auth?.user);
  const showSearch = useSelector((state) => state.other.search);

  const navigate = useNavigate();

  const [searchUser, { isLoading, data, isError, error }] =
    useLazySearchUserQuery();

  const { data: getFriendsData } = useGetFriendsQuery(sender);
  const { data: pendingFriendRequestData } = useGetPendingFriendRequestQuery();

  const [sendFriendRequest, isSending] = useAsyncMutation(useSendFriendRequestMutation);
  const [makeFriendRequestNotification] =
    useMakeFriendRequestNotificationMutation();
  const searchResultsRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      searchUser(searchValue.trim());
    }
  };

  const handleSendFriendRequest = async (receiver) => {
    try {
      await sendFriendRequest("Sending Friend Request...", { sender, receiver });
      makeFriendRequestNotification({ friendId: receiver });
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewProfile = (id) => {
    navigate(`/profile/${id}`);
    setSearchValue("");
  };

  // Snappy 300ms debounce for ultra-responsive search
  useEffect(() => {
    if (!searchValue.trim()) return;

    const timeOutId = setTimeout(() => {
      searchUser(searchValue.trim());
    }, 300);

    return () => clearTimeout(timeOutId);
  }, [searchValue, searchUser]);

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target)
      ) {
        setSearchValue("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!showSearch) return null;

  const results = data?.payload || [];

  return (
    <div
      ref={searchResultsRef}
      className="relative w-full max-w-sm sm:max-w-md mx-auto z-40"
    >
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none transition-colors group-focus-within:text-cyan-500">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <HiMagnifyingGlass className="w-4 h-4" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          placeholder="Search people & connect..."
          className="w-full py-2 pl-10 pr-16 bg-gray-100/80 dark:bg-[#161822] text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-2xl border border-gray-200/80 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/80 focus:bg-white dark:focus:bg-[#12131a] transition-all shadow-sm"
        />

        {/* Right Badge / Clear Action */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchValue ? (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-white/10 transition"
              title="Clear search"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-200/60 dark:bg-white/5 border border-gray-300/60 dark:border-white/10 rounded-md">
              ⌘K
            </kbd>
          )}
        </div>
      </form>

      {/* Floating Results Popover */}
      <AnimatePresence>
        {searchValue.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white dark:bg-[#12131a] rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-2xl overflow-hidden p-2 max-h-[380px] overflow-y-auto custom-scrollbar"
          >
            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-400">
                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Searching users...</span>
              </div>
            ) : isError ? (
              <div className="py-6 px-4 text-center text-xs text-rose-500">
                {error?.data?.errorMessage || "Failed to search users."}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  People ({results.length})
                </div>

                {results.map(({ _id, name, avatar, username }) => {
                  const isFriend = getFriendsData?.payload?.friends?.some(
                    (friend) => friend._id === _id
                  );

                  const isPending =
                    pendingFriendRequestData?.payload?.pendingRequests?.some(
                      (request) => request.receiver?._id === _id
                    );

                  const isSelf = userData && _id === sender;

                  return (
                    <div
                      key={_id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition duration-150 border border-transparent hover:border-gray-200/80 dark:hover:border-white/10 group"
                    >
                      {/* Avatar and Info */}
                      <div
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                        onClick={() => handleViewProfile(_id)}
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={avatar || "https://via.placeholder.com/150"}
                            alt={name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-white/10 group-hover:scale-105 transition"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-cyan-500 transition">
                            {name}
                          </h4>
                          <p className="text-xs text-gray-400 truncate">
                            @{username || "user"}
                          </p>
                        </div>
                      </div>

                      {/* Action Pills */}
                      <div className="flex-shrink-0">
                        {isSelf ? (
                          <button
                            onClick={() => handleViewProfile(_id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition"
                          >
                            You
                          </button>
                        ) : isFriend ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <FaUserCheck className="w-3 h-3" />
                            Friends
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Pending
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendFriendRequest(_id)}
                            disabled={isSending}
                            className="btn-grad text-xs font-semibold px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5"
                          >
                            <FaUserPlus className="w-3 h-3" />
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  No users found
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Check the spelling or try searching a different username
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
