import React, { useEffect, useState } from "react";
import {
  useAddGroupMembersMutation,
  useDeleteGroupMutation,
  useGetFriendsQuery,
  useGetGroupDetailsQuery,
  useRemoveGroupMembersMutation,
  useRenameGroupChatMutation
} from "../../app/api/api";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const MyGroupInfo = ({ groupId }) => {
  const userId = useSelector((state) => state.auth.user._id);

  const [chatName, setChatName] = useState("");
  const [removeCheckedMembers, setRemoveMemberCheckedMembers] = useState([]);
  const [addMemberCheckedMembers, setAddMemberCheckedMembers] = useState([]);

  const { data, isError, isLoading, error } = useGetGroupDetailsQuery(groupId);
  const {
    data: friendsData,
    isError: friendsIsError,
    isLoading: friendsIsLoading,
    error: friendsError
  } = useGetFriendsQuery(userId);
  const [renameGroupChat, renameGroupChatLoading] = useAsyncMutation(
    useRenameGroupChatMutation
  );
  const [addGroupMember, addGroupMemberLoading] = useAsyncMutation(
    useAddGroupMembersMutation
  );
  const [removeGroupMember, removeGroupMemberLoading] = useAsyncMutation(
    useRemoveGroupMembersMutation
  );
  const [deleteGroup, deleteGroupLoading] = useAsyncMutation(
    useDeleteGroupMutation
  );

  const handleNameChange = (e) => {
    setChatName(e.target.value);
  };

  const handleNameSave = async () => {
    if (!chatName) return;
    const updateData = { chatId: groupId, name: chatName };
    renameGroupChat("Updating group name...", updateData);
  };

  const handleAddMemberCheckboxChange = (memberId) => {
    setAddMemberCheckedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleRemoveMemberCheckboxChange = (memberId) => {
    setRemoveMemberCheckedMembers((prevChecked) =>
      prevChecked.includes(memberId)
        ? prevChecked.filter((id) => id !== memberId)
        : [...prevChecked, memberId]
    );
  };

  const currentMembersId = data?.payload?.chat?.members.map(
    (member) => member._id
  );

  const friendsNotInGroup = friendsData?.payload?.friends.filter(
    (friend) => !currentMembersId?.includes(friend._id)
  );

  const handleAddMemberClick = () => {
    if (addMemberCheckedMembers.length < 1) return;

    const addMemberData = { groupId, members: addMemberCheckedMembers };
    addGroupMember("Adding group member...", addMemberData);

    setAddMemberCheckedMembers([]);
  };

  const handleRemoveMemberClick = () => {
    if (removeCheckedMembers.length < 1) return;
    const removeMemberData = { groupId, members: removeCheckedMembers };
    removeGroupMember("Removing group member...", removeMemberData);
    setRemoveMemberCheckedMembers([]);
  };

  const handleDeleteChat = () => {
    deleteGroup("Deleting group...", groupId);
  };

  useEffect(() => {
    if (data?.payload?.chat?.chatName) {
      setChatName(data.payload.chat.chatName);
    }
    return () => {
      setRemoveMemberCheckedMembers([]);
      setAddMemberCheckedMembers([]);
    };
  }, [data]);

  if (isLoading)
    return (
      <div className="text-center text-lg h-[94.7vh] text-gray-700 dark:bg-gray-900">
        Loading group details...
      </div>
    );
  if (isError)
    return (
      <div className="text-center h-[94.7vh] dark:bg-gray-900 text-lg text-red-600 dark:text-red-400">
        Error loading group details: {error?.message}
      </div>
    );

  return (
    
    <div className="sm:h-[94.7vh] bg-gray-100 dark:bg-gray-900 p-6 space-y-6">
      {/* Change Group Name */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Change Group Name
        </h2>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            value={chatName}
            onChange={handleNameChange}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition duration-300 "
            placeholder="Enter chat name"
          />
          <button
            onClick={handleNameSave}
            className="w-[100px] sm:w-auto px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition duration-300 flex-shrink-0"
            disabled={renameGroupChatLoading}
          >
            {renameGroupChatLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Add Member */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 bg-[#15803D] p-2 rounded-md text-center">
          Add Member
        </h2>
        {friendsNotInGroup?.length > 0 ? (
          <div className="mt-4">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Select members to add and press the Add Member button.
            </p>
            {friendsNotInGroup.map((friend) => (
              <div
                key={friend._id}
                className="flex items-center space-x-4 mb-2"
              >
                <Link
                  to={`/profile/${friend._id}`}
                  className="text-orange-500 dark:text-orange-400 font-semibold underline"
                >
                  {friend.name}
                </Link>
                <input
                  type="checkbox"
                  checked={addMemberCheckedMembers.includes(friend._id)}
                  onChange={() => handleAddMemberCheckboxChange(friend._id)}
                  className="cursor-pointer"
                />
              </div>
            ))}
            <button
              className="mt-4 bg-[#15803D] dark:bg-[#15803D] text-white px-4 py-2 rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition duration-300"
              onClick={handleAddMemberClick}
            >
              Add Member
            </button>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">
            All your friends are already in the group or you have no friends to
            add.
          </p>
        )}
      </div>

      {/* Remove Member */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 bg-[#B91C1C] p-2 rounded-md text-center">
          Remove Member
        </h2>
        {data?.payload?.chat?.members.length > 0 ? (
          <div className="mt-4">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Select members to remove and press the Remove Member button.
            </p>
            {data.payload.chat.members.map((member) => (
              <div
                key={member._id}
                className="flex items-center space-x-4 mb-2"
              >
                <Link
                  to={`/profile/${member._id}`}
                  className="text-orange-500 dark:text-orange-400 font-semibold underline"
                >
                  {member.name}
                </Link>
                <input
                  type="checkbox"
                  checked={removeCheckedMembers.includes(member._id)}
                  onChange={() => handleRemoveMemberCheckboxChange(member._id)}
                  className="cursor-pointer"
                />
              </div>
            ))}
            <button
              className="mt-4 bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-600 dark:hover:bg-red-700 transition duration-300"
              onClick={handleRemoveMemberClick}
            >
              Remove Member
            </button>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">
            You do not have any members to remove.
          </p>
        )}
      </div>

      {/* Delete Group */}
      <div className="text-center">
        <button
          className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-600 dark:hover:bg-red-700 transition duration-300"
          onClick={handleDeleteChat}
        >
          Delete Chat
        </button>
      </div>
    </div>
  );
};

export default MyGroupInfo;
