import { useEffect, useRef, useState } from "react";
import { IoSearch } from "react-icons/io5";
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

const Search = () => {
  const [searchValue, setSearchValue] = useState("");
  const sender = useSelector((state) => state.auth?.user?._id);
  const userData = useSelector((state) => state.auth?.user);

  const navigate = useNavigate();

  const [searchUser, { isLoading, data, isError, error }] =
    useLazySearchUserQuery();

  const {
    data: getFriendsData,
    error: getFriendsError,
    isLoading: getFriendsLoading
  } = useGetFriendsQuery(sender);

  const {
    data: pendingFriendRequestData,
    isLoading: pendingFriendRequestLoading,
    error: pendingFriendRequestError
  } = useGetPendingFriendRequestQuery();

  const [sendFriendRequest] = useAsyncMutation(useSendFriendRequestMutation);
  const [makeFriendRequestNotification] =
    useMakeFriendRequestNotificationMutation();
  const searchResultsRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchValue) {
      searchUser(searchValue);
    }
  };

  const handleSendFriendRequest = async (receiver) => {
    try {
      await sendFriendRequest("Sending Friend Request!!", { sender, receiver });
      makeFriendRequestNotification({ friendId: receiver });
    } catch (err) {
      console.log(err);
    }
  };

  const handleViewProfile = (id) => {
    navigate(`/profile/${id}`);
    setSearchValue("");
  };

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (searchValue) {
        searchUser(searchValue);
      }
    }, 1000);
    return () => clearTimeout(timeOutId);
  }, [searchValue, searchUser]);

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

  return (
    <div className="relative w-full  sm:max-w-[400px] mx-auto">
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="search"
          className="bg-white dark:bg-[#3A3B3C] dark:text-white px-2 py-1 sm:py-1.5 sm:px-3 flex-grow border border-[#454647] rounded-s-full outline-none transition duration-300 hover:shadow-lg focus:shadow-lg text-sm w-32 sm:w-full"
          onChange={(e) => setSearchValue(e.target.value)}
          spellCheck={false}
          placeholder="Search users..."
        />
        <button
          type="submit"
          className="dark:bg-[#3A3B3C] border-r border-y border-[#454647] text-gray-700 dark:text-white dark:hover:bg-[#303031] transition duration-300 px-2 dark:py-[4px] sm:dark:py-[6px] sm:px-4 rounded-r-full flex items-center justify-center sm:py-[6px]  hover:bg-gray-300"
        >
          <IoSearch size={20} />
        </button>
      </form>

      {searchValue && (
        <div
          ref={searchResultsRef}
          className={`absolute mt-2 w-full bg-white dark:bg-[#222222] shadow-lg rounded-md z-10 ${
            data || isError || isLoading ? "block" : "hidden"
          }`}
        >
          {isLoading ? (
            <div className="p-4">
              <SingleSpinner size="h-16 w-16" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data && !isError && data.payload.length > 0 ? (
                data.payload.map(({ _id, name, avatar, username }) => {
                  const isFriend = getFriendsData?.payload?.friends.some(
                    (friend) => friend._id === _id
                  );

                  const isPending =
                    pendingFriendRequestData?.payload?.pendingRequests.some(
                      (request) => request.receiver._id === _id
                    );
                  return (
                    <div
                      key={_id}
                      className="flex items-center justify-between gap-3 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition"
                    >
                      <div
                        className="flex gap-3"
                        onClick={() => handleViewProfile(_id)}
                      >
                        <img
                          src={avatar}
                          alt="Profile"
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <h3 className="font-medium dark:text-white">
                            {name}
                          </h3>
                          <h4 className="text-sm text-gray-500 dark:text-gray-400">
                            {username}
                          </h4>
                        </div>
                      </div>

                      {userData && _id === sender && (
                        <button
                          className="bg-blue-500 text-white hover:bg-blue-400 rounded-md px-2 py-1 transition duration-300"
                          onClick={() => handleViewProfile(_id)}
                        >
                          View Profile
                        </button>
                      )}

                      {userData &&
                        !isFriend &&
                        !isPending &&
                        _id !== sender && (
                          <button
                            className="bg-blue-500 text-white hover:bg-blue-400 rounded-md px-2 py-1 transition duration-300"
                            onClick={() => handleSendFriendRequest(_id)}
                          >
                            Add Friend
                          </button>
                        )}

                      {isFriend && (
                        <button className="bg-blue-500 text-white hover:bg-blue-400 rounded-md px-2 py-1 transition duration-300">
                          Friends
                        </button>
                      )}

                      {!userData && (
                        <button
                          className="bg-blue-500 text-white hover:bg-blue-400 rounded-md px-2 py-1 transition duration-300"
                          onClick={() => handleViewProfile(_id)}
                        >
                          View Profile
                        </button>
                      )}
                      {isPending && (
                        <button className="bg-blue-500 text-white hover:bg-blue-400 rounded-md px-2 py-1 transition duration-300">
                          Already sent
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4">
                  <h1 className="text-red-500">{error?.data?.errorMessage}</h1>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
