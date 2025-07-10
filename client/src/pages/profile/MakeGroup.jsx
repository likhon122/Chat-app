import { useEffect, useRef, useState } from "react";
import { FaXmark, FaUserGroup, FaUsers, FaCheck } from "react-icons/fa6";
import {
  useGetFriendsQuery,
  useMakeGroupChatMutation
} from "../../app/api/api";
import { useDispatch, useSelector } from "react-redux";
import { setMakeGroupDrawer } from "../../app/features/otherSlice";
import { Link } from "react-router-dom";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import useClickOutside from "../../hooks/useClickOutsideHook";

const MakeGroup = (props) => {
  const { makeGroupDrawer } = useSelector((state) => state.other);
  const userId = useSelector((state) => state.auth.user._id);
  const id = props?.userId;
  const dispatch = useDispatch();
  const createGroupRef = useRef();

  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupName, setGroupName] = useState("");

  const { data, isLoading } = useGetFriendsQuery(id);
  const [makeGroupChat, makingGroupLoading] = useAsyncMutation(
    useMakeGroupChatMutation
  );

  const handleClick = () => {
    dispatch(setMakeGroupDrawer(false));
  };

  const handleCheckboxChange = (friendId) => {
    setSelectedFriends((prevSelected) =>
      prevSelected.includes(friendId)
        ? prevSelected.filter((id) => id !== friendId)
        : [...prevSelected, friendId]
    );
  };

  const handleMakeGroup = () => {
    if (selectedFriends.length > 1 && groupName) {
      const makeGroupData = {
        chatName: groupName,
        members: selectedFriends
      };

      makeGroupChat("Creating group chat..", makeGroupData);
    } else {
      alert(
        "Please select at least two friends and enter a chat name to create a group."
      );
    }
  };

  useClickOutside(createGroupRef, () => {
    if (makeGroupDrawer) {
      dispatch(setMakeGroupDrawer(false));
    }
  });

  useEffect(() => {
    if (userId !== id) {
      dispatch(setMakeGroupDrawer(false));
    }
  }, [id, userId, dispatch]);

  return (
    <div
      className="bg-gradient-to-br from-gray-900 to-gray-800 text-white w-full max-w-md mx-auto rounded-xl shadow-2xl overflow-hidden border border-gray-700/50"
      ref={createGroupRef}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaUserGroup className="text-white text-xl" />
            <h2 className="text-xl font-bold">Create Group Chat</h2>
          </div>
          <button
            onClick={handleClick}
            className="bg-white/20 hover:bg-white/30 transition-colors p-2 rounded-full"
          >
            <FaXmark className="text-white text-lg" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {data && data.payload?.friends.length < 2 && (
              <div className="bg-gradient-to-r from-red-600 to-red-500 p-4 rounded-lg mb-5 shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <FaUsers className="text-white text-lg" />
                  </div>
                  <p className="text-sm font-medium">
                    You need at least 2 friends to create a group chat. Please
                    add more friends.
                  </p>
                </div>
              </div>
            )}

            {/* Group Name Input */}
            <div className="mb-6">
              <label
                htmlFor="chatName"
                className="block text-gray-300 text-sm font-medium mb-2"
              >
                GROUP NAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="chatName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter a memorable name for your group"
                  className="w-full p-3 pl-4 border border-gray-600 rounded-lg bg-gray-800/70 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
                {groupName && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-400">
                    <FaCheck />
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Choose a name that represents your group purpose
              </p>
            </div>

            {/* Selected Friends Counter */}
            {data && data.payload?.friends.length > 1 && (
              <div className="mb-4 bg-gray-800/70 rounded-lg p-3 flex justify-between items-center">
                <span className="text-sm text-gray-300">Selected friends</span>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    selectedFriends.length > 1
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {selectedFriends.length} / {data.payload.friends.length}
                </span>
              </div>
            )}

            {/* Friends List */}
            {data && data.payload?.friends.length > 1 && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {data.payload.friends.map((friend) => {
                  const isSelected = selectedFriends.includes(friend._id);
                  return (
                    <div
                      key={friend._id}
                      className={`
                        p-3 rounded-lg flex items-center justify-between transition-all duration-200
                        ${
                          isSelected
                            ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30"
                            : "bg-gray-800/70 hover:bg-gray-700/70 border border-transparent"
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          {friend.avatar ? (
                            <img
                              src={friend.avatar}
                              alt={friend.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-semibold text-gray-300">
                              {friend.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <Link
                            to={`/profile/${friend._id}`}
                            className="font-medium text-gray-200 hover:text-orange-400 transition-colors"
                          >
                            {friend.name}
                          </Link>
                          <p className="text-xs text-gray-400">
                            @{friend.username || "username"}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCheckboxChange(friend._id)}
                          className="sr-only"
                        />
                        <div
                          className={`
                          w-5 h-5 border rounded transition-colors
                          ${
                            isSelected
                              ? "bg-orange-500 border-orange-600"
                              : "bg-gray-700 border-gray-600"
                          }
                        `}
                        >
                          {isSelected && (
                            <FaCheck className="text-white text-xs mx-auto my-auto h-full" />
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Create Button */}
            <div className="mt-6">
              <button
                className={`
                  w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2
                  ${
                    selectedFriends.length > 1 && groupName
                      ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }
                `}
                onClick={handleMakeGroup}
                disabled={
                  !(selectedFriends.length > 1 && groupName) ||
                  makingGroupLoading
                }
              >
                {makingGroupLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <FaUserGroup />
                    <span>Create Group Chat</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-2">
                {selectedFriends.length <= 1 && groupName
                  ? "Select at least 2 friends to continue"
                  : !groupName && selectedFriends.length > 1
                  ? "Enter a group name to continue"
                  : selectedFriends.length <= 1 && !groupName
                  ? "Select friends and enter a group name"
                  : "Ready to create your group chat!"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MakeGroup;
