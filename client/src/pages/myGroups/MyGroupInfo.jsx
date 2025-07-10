import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaUsers,
  FaUserPlus,
  FaUserMinus,
  FaPencilAlt,
  FaTrashAlt,
  FaExclamationTriangle,
  FaUserCheck,
  FaUserTimes
} from "react-icons/fa";
import { HiOutlineX } from "react-icons/hi";

import {
  useAddGroupMembersMutation,
  useDeleteGroupMutation,
  useGetFriendsQuery,
  useGetGroupDetailsQuery,
  useRemoveGroupMembersMutation,
  useRenameGroupChatMutation
} from "../../app/api/api";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";

// eslint-disable-next-line react/prop-types
const MyGroupInfo = ({ groupId }) => {
  const userId = useSelector((state) => state.auth.user._id);

  const [chatName, setChatName] = useState("");
  const [removeCheckedMembers, setRemoveMemberCheckedMembers] = useState([]);
  const [addMemberCheckedMembers, setAddMemberCheckedMembers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, isError, isLoading, error } = useGetGroupDetailsQuery(groupId);
  const { data: friendsData } = useGetFriendsQuery(userId);

  const [renameGroupChat, renameGroupChatLoading] = useAsyncMutation(
    useRenameGroupChatMutation
  );
  const [addGroupMember, addingMemberLoading] = useAsyncMutation(
    useAddGroupMembersMutation
  );
  const [removeGroupMember, removingMemberLoading] = useAsyncMutation(
    useRemoveGroupMembersMutation
  );
  const [deleteGroup, deletingGroupLoading] = useAsyncMutation(
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

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-pulse flex space-x-4">
            <div className="h-16 w-16 rounded-full bg-blue-400 dark:bg-blue-600"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-blue-400 dark:bg-blue-600 rounded w-48"></div>
              <div className="space-y-2">
                <div className="h-3 bg-blue-300 dark:bg-blue-700 rounded w-40"></div>
                <div className="h-3 bg-blue-300 dark:bg-blue-700 rounded w-32"></div>
              </div>
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            Loading group details...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center max-w-lg">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
            Error Loading Group
          </h2>
          <p className="text-red-600 dark:text-red-300">
            {error?.message || "There was a problem loading the group details."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Group Settings</h1>
        <p className="opacity-80 text-sm">
          Manage your group details and members
        </p>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Change Group Name */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center">
              <FaPencilAlt className="text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Group Name
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="text"
                value={chatName}
                onChange={handleNameChange}
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter chat name"
              />
              <button
                onClick={handleNameSave}
                className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={renameGroupChatLoading}
              >
                {renameGroupChatLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  "Update Name"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Current Members */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaUsers className="text-blue-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Current Members
                </h2>
              </div>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                {data.payload.chat.members.length} members
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.payload.chat.members.map((member) => (
              <div
                key={member._id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <Link
                      to={`/profile/${member._id}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    >
                      {member.name}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {member.username || "Member"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Member */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="bg-green-50 dark:bg-green-900/30 p-4 border-b border-green-200 dark:border-green-900">
            <div className="flex items-center">
              <FaUserPlus className="text-green-500 mr-2" />
              <h2 className="text-lg font-semibold text-green-700 dark:text-green-400">
                Add Members
              </h2>
            </div>
          </div>

          {friendsNotInGroup?.length > 0 ? (
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Select friends to add to this group:
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {friendsNotInGroup.map((friend) => {
                  const isChecked = addMemberCheckedMembers.includes(
                    friend._id
                  );
                  return (
                    <div
                      key={friend._id}
                      className={`
                        p-3 rounded-lg flex items-center justify-between transition-all duration-200
                        ${
                          isChecked
                            ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                          {friend.avatar ? (
                            <img
                              src={friend.avatar}
                              alt={friend.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">
                              {friend.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            to={`/profile/${friend._id}`}
                            className="font-medium text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400"
                          >
                            {friend.name}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            @{friend.username || "username"}
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            handleAddMemberCheckboxChange(friend._id)
                          }
                          className="sr-only peer"
                        />
                        <div
                          className={`
                          w-6 h-6 rounded-md border transition-all duration-200
                          ${
                            isChecked
                              ? "bg-green-500 border-green-600 flex items-center justify-center"
                              : "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          }
                        `}
                        >
                          {isChecked && (
                            <FaUserCheck className="text-white text-sm" />
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>

              <button
                className={`
                  mt-4 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center
                  ${
                    addMemberCheckedMembers.length > 0
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }
                `}
                onClick={handleAddMemberClick}
                disabled={
                  addMemberCheckedMembers.length === 0 || addingMemberLoading
                }
              >
                {addingMemberLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <FaUserPlus className="mr-2" />
                    <span>Add Selected Members</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                All your friends are already in the group or you have no friends
                to add.
              </p>
            </div>
          )}
        </div>

        {/* Remove Member */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="bg-red-50 dark:bg-red-900/30 p-4 border-b border-red-200 dark:border-red-900">
            <div className="flex items-center">
              <FaUserMinus className="text-red-500 mr-2" />
              <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
                Remove Members
              </h2>
            </div>
          </div>

          {data?.payload?.chat?.members.length > 0 ? (
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Select members to remove from this group:
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {data.payload.chat.members.map((member) => {
                  const isChecked = removeCheckedMembers.includes(member._id);
                  return (
                    <div
                      key={member._id}
                      className={`
                        p-3 rounded-lg flex items-center justify-between transition-all duration-200
                        ${
                          isChecked
                            ? "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            to={`/profile/${member._id}`}
                            className="font-medium text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400"
                          >
                            {member.name}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            @{member.username || "username"}
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            handleRemoveMemberCheckboxChange(member._id)
                          }
                          className="sr-only peer"
                        />
                        <div
                          className={`
                          w-6 h-6 rounded-md border transition-all duration-200
                          ${
                            isChecked
                              ? "bg-red-500 border-red-600 flex items-center justify-center"
                              : "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          }
                        `}
                        >
                          {isChecked && (
                            <FaUserTimes className="text-white text-sm" />
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>

              <button
                className={`
                  mt-4 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center
                  ${
                    removeCheckedMembers.length > 0
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }
                `}
                onClick={handleRemoveMemberClick}
                disabled={
                  removeCheckedMembers.length === 0 || removingMemberLoading
                }
              >
                {removingMemberLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <FaUserMinus className="mr-2" />
                    <span>Remove Selected Members</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                There are no members to remove from this group.
              </p>
            </div>
          )}
        </div>

        {/* Delete Group */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-12">
          <div className="bg-red-50 dark:bg-red-900/30 p-4 border-b border-red-200 dark:border-red-900">
            <div className="flex items-center">
              <FaTrashAlt className="text-red-500 mr-2" />
              <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
                Danger Zone
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white mb-1">
                  Delete this group
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Once deleted, you cannot recover this group and all its
                  messages.
                </p>
              </div>
              <button
                className="mt-4 sm:mt-0 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium flex items-center"
                onClick={() => setShowDeleteModal(true)}
              >
                <FaTrashAlt className="mr-2" />
                Delete Group
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full animate-scale-in">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
                <FaExclamationTriangle className="text-red-500 mr-2" />
                Delete Group
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete
                <span className="font-semibold">
                  {data.payload.chat.chatName}
                </span>
                This action cannot be undone and all messages will be lost.
              </p>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteChat();
                    setShowDeleteModal(false);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                  disabled={deletingGroupLoading}
                >
                  {deletingGroupLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <FaTrashAlt className="mr-2" />
                      <span>Delete Group</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGroupInfo;
