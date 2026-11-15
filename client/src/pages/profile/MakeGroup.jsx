import { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaXmark, FaCheck } from "react-icons/fa6";
import {
  HiUsers,
  HiUserPlus,
  HiMagnifyingGlass,
  HiXMark,
  HiSparkles,
  HiArrowPath,
} from "react-icons/hi2";
import {
  useGetFriendsQuery,
  useMakeGroupChatMutation,
} from "../../app/api/api";
import { setMakeGroupDrawer } from "../../app/features/otherSlice";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import { toast } from "../../utils/alert";

const MakeGroup = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { makeGroupDrawer } = useSelector((state) => state.other);
  const loggedInUserId = useSelector((state) => state.auth?.user?._id);
  const targetUserId = props?.userId || loggedInUserId;

  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const modalRef = useRef();

  const { data, isLoading } = useGetFriendsQuery(targetUserId, {
    skip: !targetUserId || !makeGroupDrawer,
  });

  const [makeGroupChat, makingGroupLoading] = useAsyncMutation(
    useMakeGroupChatMutation
  );

  const friends = useMemo(
    () => data?.payload?.friends || [],
    [data?.payload?.friends]
  );

  // Filtered friends based on live search
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    const q = searchQuery.toLowerCase().trim();
    return friends.filter(
      (f) =>
        f.name?.toLowerCase().includes(q) ||
        f.username?.toLowerCase().includes(q)
    );
  }, [friends, searchQuery]);

  const handleClose = () => {
    dispatch(setMakeGroupDrawer(false));
    setGroupName("");
    setSelectedFriends([]);
    setSearchQuery("");
  };

  const handleCheckboxChange = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleToggleAll = () => {
    if (selectedFriends.length === filteredFriends.length) {
      setSelectedFriends([]);
    } else {
      setSelectedFriends(filteredFriends.map((f) => f._id));
    }
  };

  const handleMakeGroup = async (e) => {
    e?.preventDefault();
    if (!groupName.trim()) {
      toast.warning("Please enter a group name.");
      return;
    }
    if (selectedFriends.length < 2) {
      toast.warning(
        "Please select at least 2 friends to form a group channel."
      );
      return;
    }

    const makeGroupData = {
      chatName: groupName.trim(),
      members: selectedFriends,
    };

    const res = await makeGroupChat("Creating group channel...", makeGroupData);
    if (res?.success) {
      handleClose();
      const newChatId = res.data?.payload?.chat?._id;
      if (newChatId) {
        navigate(`/chat/${newChatId}?group-chat=true`);
      }
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && makeGroupDrawer) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [makeGroupDrawer]);

  if (!makeGroupDrawer) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-[#0f1017] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative text-gray-100 flex flex-col max-h-[90vh]"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <HiUsers className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Create Group Channel
              </h2>
              <p className="text-xs text-gray-400">
                Select at least 2 friends to start a group
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
            title="Close"
          >
            <FaXmark className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Group Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Group Title
            </label>
            <input
              type="text"
              placeholder="e.g. Project Core Team, Gaming Squad..."
              value={groupName}
              maxLength={50}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/60 focus:bg-white/[0.07] transition-all"
            />
          </div>

          {/* Members Selection Header & Search */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Select Members ({selectedFriends.length} selected)
              </label>
              <span className="text-[11px] text-cyan-400 font-semibold">
                Min 2 required
              </span>
            </div>

            {/* Friend Filter Input */}
            {friends.length > 0 && (
              <div className="relative mb-2">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter friends..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-500/50 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    <HiXMark className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Quick Toggle All Button */}
            {filteredFriends.length > 0 && (
              <div className="flex items-center justify-between text-xs mb-2 px-1">
                <button
                  type="button"
                  onClick={handleToggleAll}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition cursor-pointer text-[11px]"
                >
                  {selectedFriends.length === filteredFriends.length
                    ? "Deselect All"
                    : "Select All Friends"}
                </button>
                <span className="text-[11px] text-gray-500">
                  {filteredFriends.length} available
                </span>
              </div>
            )}

            {/* Friends List Roster */}
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              </div>
            ) : friends.length === 0 ? (
              <div className="py-8 text-center rounded-2xl bg-white/[0.02] border border-white/5 p-4">
                <HiUsers className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-bold text-white mb-1">
                  No Friends Found
                </p>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                  You need connected friends to start a group channel. Send a friend
                  request from the Friends tab first!
                </p>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                No friends match "{searchQuery}"
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredFriends.map((friend) => {
                  const isSelected = selectedFriends.includes(friend._id);
                  return (
                    <div
                      key={friend._id}
                      onClick={() => handleCheckboxChange(friend._id)}
                      className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all ${
                        isSelected
                          ? "bg-cyan-500/15 border-cyan-500/40 shadow-md shadow-cyan-500/5"
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-gray-800 flex-shrink-0">
                          {friend.avatar?.url || friend.avatar ? (
                            <img
                              src={friend.avatar?.url || friend.avatar}
                              alt={friend.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                              {friend.name ? friend.name.charAt(0).toUpperCase() : "U"}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-white truncate">
                            {friend.name}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {friend.username ? `@${friend.username}` : "Friend"}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                          isSelected
                            ? "bg-cyan-500 border-cyan-400 text-white"
                            : "border-white/20 bg-white/5"
                        }`}
                      >
                        {isSelected && (
                          <FaCheck className="w-3 h-3 stroke-[3]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 flex items-center justify-end gap-3 bg-white/[0.02]">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition active:scale-95 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleMakeGroup}
            disabled={
              makingGroupLoading ||
              selectedFriends.length < 2 ||
              !groupName.trim()
            }
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            {makingGroupLoading ? (
              <>
                <HiArrowPath className="w-3.5 h-3.5 animate-spin" />
                <span>Creating Group...</span>
              </>
            ) : (
              <>
                <HiUserPlus className="w-4 h-4" />
                <span>
                  Create Group{" "}
                  {selectedFriends.length > 0
                    ? `(${selectedFriends.length + 1})`
                    : ""}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MakeGroup;
