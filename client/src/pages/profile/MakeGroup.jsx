import React, { useEffect, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";
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
  const id = props.userId;
  const dispatch = useDispatch();
  const createGroupRef = useRef();

  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupName, setGroupName] = useState("");

  const { data, isError, error, isLoading } = useGetFriendsQuery(id);
  const [makeGroupChat, makingGroupLoading, makingGroupData] = useAsyncMutation(
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
      className="bg-gray-950  text-white  w-full max-w-md mx-auto  rounded-lg shadow-lg overflow-hidden"
      ref={createGroupRef}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Create Group Chat</h2>
          <FaXmark
            color="white"
            size={24}
            onClick={handleClick}
            className="cursor-pointer"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <h1>Loading...</h1>
          </div>
        ) : (
          <>
            {data && data.payload?.friends.length < 2 && (
              <div className="bg-red-600 p-3 rounded mb-4 text-center">
                <h1 className="text-lg">
                  You need at least 2 friends to create a group chat. Please add
                  more friends.
                </h1>
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="chatName"
                className="block text-lg font-medium mb-2"
              >
                Chat Name
              </label>
              <input
                type="text"
                id="chatName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter chat name"
                className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {data && data.payload?.friends.length > 1 && (
              <div className="space-y-2">
                {data.payload.friends.map((friend) => (
                  <div
                    key={friend._id}
                    className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 flex items-center justify-between"
                  >
                    <div className="text-orange-400 font-semibold">
                      <Link
                        to={`/profile/${friend._id}`}
                        className="hover:underline"
                      >
                        {friend.name}
                      </Link>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend._id)}
                      onChange={() => handleCheckboxChange(friend._id)}
                      className="cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}

            {selectedFriends.length > 1 && (
              <div className="flex justify-end mt-4">
                <button
                  className="bg-orange-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  onClick={handleMakeGroup}
                >
                  {makingGroupLoading ? "Creating..." : "Make Group"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MakeGroup;
