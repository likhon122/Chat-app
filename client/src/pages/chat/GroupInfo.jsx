import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  IoMdExit,
  IoIosArrowBack,
  IoMdPeople,
  IoMdTime,
  IoMdTrash
} from "react-icons/io";
import { FaTimes, FaUsers, FaShieldAlt, FaCheck } from "react-icons/fa";
import { HiSparkles, HiUserPlus, HiMagnifyingGlass } from "react-icons/hi2";
import {
  useDeleteGroupMutation,
  useGetGroupDetailsQuery,
  useLeaveGroupMutation,
  useAddGroupMembersMutation,
  useGetFriendsQuery
} from "../../app/api/api";
import { timeSince } from "../../helper/timeSince";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { setGroupInfoDrawer } from "../../app/features/otherSlice";
import { toast } from "../../utils/alert";

const GroupInfo = ({ chatId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friendSearch, setFriendSearch] = useState("");
  const { isUserOnline } = useOnlineStatus();

  const { data, isError, isLoading } = useGetGroupDetailsQuery(chatId);
  const { data: friendsData, isLoading: friendsLoading } = useGetFriendsQuery(
    user?._id,
    { skip: !data?.payload?.chat?.groupChat }
  );

  const [leaveGroup, leaveGroupLoading] = useAsyncMutation(
    useLeaveGroupMutation
  );
  const [deleteChat, deleteChatLoading] = useAsyncMutation(
    useDeleteGroupMutation
  );
  const [addGroupMembers, addingMembersLoading] = useAsyncMutation(
    useAddGroupMembersMutation
  );

  const created = timeSince(data?.payload?.chat?.createdAt);

  const chat = data?.payload?.chat;
  const isGroupChat = chat?.groupChat;
  const otherMember = chat?.members?.filter((m) => m._id !== user._id)[0];

  const chatTitle = isGroupChat
    ? chat?.chatName
    : otherMember?.name || "Conversation";

  const currentMemberIds = new Set(
    chat?.members?.map((m) => (m?._id || m)?.toString()) || []
  );

  const friends = friendsData?.payload?.friends || [];

  const availableFriends = friends.filter(
    (friend) => !currentMemberIds.has(friend._id?.toString())
  );

  const filteredAvailableFriends = availableFriends.filter((friend) => {
    if (!friendSearch.trim()) return true;
    const term = friendSearch.toLowerCase();
    const nameMatch = friend.name?.toLowerCase().includes(term);
    const usernameMatch = friend.username?.toLowerCase().includes(term);
    return nameMatch || usernameMatch;
  });

  const handleToggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleAddMembersSubmit = async () => {
    if (!selectedFriends.length) return;

    const res = await addGroupMembers("Adding people to group...", {
      groupId: chatId,
      chatId,
      members: selectedFriends
    });

    if (res?.success) {
      setSelectedFriends([]);
      setFriendSearch("");
      setShowAddMemberModal(false);
      toast.success("Added to group successfully!");
    }
  };

  const leaveGroupHandler = () => {
    toast.confirm("Leave this group?", {
      description: "You will no longer receive new messages or updates.",
      confirmText: "Leave Group",
      cancelText: "Stay",
      onConfirm: () => {
        leaveGroup("Leaving group...", chatId);
      }
    });
  };

  const removeFriendAndDeleteChatHandler = () => {
    toast.confirm("Delete messages on your side?", {
      description: "Messages will only be deleted for you. Your friendship and your friend's messages will remain untouched.",
      confirmText: "Delete for Me",
      cancelText: "Cancel",
      onConfirm: () => {
        deleteChat("Deleting messages...", chatId);
      }
    });
  };

  useEffect(() => {
    if (leaveGroupLoading?.success || deleteChatLoading?.success) {
      navigate("/chat");
    }
  }, [leaveGroupLoading, navigate, deleteChatLoading]);

  if (isLoading) {
    return (
      <div className="h-full bg-white dark:bg-[#12131a] rounded-2xl overflow-hidden border border-gray-200/80 dark:border-white/10 shadow-xl flex items-center justify-center p-6">
        <div className="animate-pulse space-y-4 text-center w-full">
          <div className="w-20 h-20 bg-gray-200 dark:bg-white/10 rounded-full mx-auto" />
          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/2 mx-auto" />
          <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/3 mx-auto" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full bg-white dark:bg-[#12131a] rounded-2xl overflow-hidden border border-gray-200/80 dark:border-white/10 shadow-xl flex items-center justify-center p-6 text-center text-rose-500">
        <div>
          <p className="font-semibold text-sm">Failed to load info</p>
          <button
            onClick={() => dispatch(setGroupInfoDrawer(false))}
            className="mt-3 text-xs text-cyan-500 hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-[#12131a] rounded-2xl overflow-hidden border border-gray-200/80 dark:border-white/10 shadow-xl flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(setGroupInfoDrawer(false))}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/10 transition"
          >
            <IoIosArrowBack className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            {isGroupChat ? "Group Info" : "Contact Info"}
          </h2>
        </div>

        <button
          onClick={() => dispatch(setGroupInfoDrawer(false))}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/10 transition"
          title="Close details"
        >
          <FaTimes className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Info Hero */}
      <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative mb-3">
          {isGroupChat ? (
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#16222A] to-[#26a0da] p-0.5 shadow-xl flex items-center justify-center">
              <div className="w-full h-full bg-[#12131a] rounded-[22px] flex items-center justify-center text-cyan-400">
                <FaUsers className="w-8 h-8" />
              </div>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white dark:border-[#161822] shadow-xl ring-2 ring-cyan-500/30">
              <img
                src={otherMember?.avatar || "https://via.placeholder.com/150"}
                alt={chatTitle}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {chatTitle}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
          <IoMdTime className="text-cyan-500" />
          <span>Created {created}</span>
        </div>

        {/* Stats Pill Badges */}
        <div className="flex gap-4 mt-4">
          <div className="px-4 py-2 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-center min-w-[80px]">
            <div className="text-lg font-black text-cyan-500">
              {chat?.members?.length || 0}
            </div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
              Members
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-center min-w-[80px]">
            <div className="text-lg font-black text-emerald-500">
              {chat?.messages?.length || 0}
            </div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
              Messages
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <IoMdPeople className="text-cyan-500" />
            Members ({chat?.members?.length || 0})
          </span>
          {isGroupChat && (
            <button
              type="button"
              onClick={() => setShowAddMemberModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 transition shadow-sm active:scale-95 cursor-pointer"
              title="Add people to this group"
            >
              <HiUserPlus className="w-3.5 h-3.5" />
              <span>Add People</span>
            </button>
          )}
        </div>

        {/* Quick Add People Card for Group Chats */}
        {isGroupChat && (
          <button
            type="button"
            onClick={() => setShowAddMemberModal(true)}
            className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 transition group cursor-pointer mb-2 active:scale-[0.99]"
          >
            <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition shrink-0">
              <HiUserPlus className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                Add People
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                Invite friends to this group
              </div>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-cyan-500 text-white shadow-sm">
              Add
            </span>
          </button>
        )}

        {chat?.members?.map((member) => {
          const isOnline = isUserOnline(member._id) || Boolean(member.isOnline);
          return (
            <Link
              to={`/profile/${member._id}`}
              key={member._id}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition border border-transparent hover:border-gray-200 dark:hover:border-white/10"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={member.avatar || "https://via.placeholder.com/150"}
                  alt={member.name}
                  className="w-9 h-9 rounded-full object-cover border border-white/10"
                />
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white dark:border-[#12131a] transition-colors ${
                    isOnline
                      ? "bg-emerald-500 shadow-[0_0_6px_#10b981]"
                      : "bg-gray-400 dark:bg-gray-600"
                  }`}
                  title={isOnline ? "Online" : "Offline"}
                />
              </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                {member.name}
              </div>
              <div className="text-[11px] text-gray-400 truncate">
                @{member.username || "user"}
              </div>
            </div>

            {member._id === user._id && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                You
              </span>
            )}
          </Link>
        );
      })}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
        {isGroupChat ? (
          <button
            onClick={leaveGroupHandler}
            disabled={leaveGroupLoading?.isLoading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 flex items-center justify-center gap-2 transition"
          >
            <IoMdExit className="w-4 h-4" />
            <span>Leave Group</span>
          </button>
        ) : (
          <button
            onClick={removeFriendAndDeleteChatHandler}
            disabled={deleteChatLoading?.isLoading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 flex items-center justify-center gap-2 transition"
          >
            <IoMdTrash className="w-4 h-4" />
            <span>Delete for Me</span>
          </button>
        )}
      </div>

      {/* Add People Modal */}
      {showAddMemberModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            setShowAddMemberModal(false);
            setSelectedFriends([]);
            setFriendSearch("");
          }}
        >
          <div
            className="bg-white dark:bg-[#12131a] w-full max-w-md rounded-3xl border border-gray-200/80 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center">
                  <HiUserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Add People
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[220px]">
                    {chatTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSelectedFriends([]);
                  setFriendSearch("");
                }}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/10 transition cursor-pointer"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-gray-100 dark:border-white/5">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                  placeholder="Search friends by name..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-gray-50 dark:bg-[#161822] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            {/* Friends Selection List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 min-h-[160px] max-h-[340px]">
              {friendsLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <div className="w-7 h-7 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                  <span className="text-xs text-gray-400">Loading friends...</span>
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <p className="text-xs text-gray-400 mb-3">
                    You don&apos;t have any friends in your list yet.
                  </p>
                  <Link
                    to="/friends"
                    onClick={() => {
                      setShowAddMemberModal(false);
                      dispatch(setGroupInfoDrawer(false));
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500 text-white hover:bg-cyan-600 transition"
                  >
                    Find Friends
                  </Link>
                </div>
              ) : availableFriends.length === 0 ? (
                <div className="text-center py-8 px-4 text-xs text-gray-400">
                  All your friends are already in this group!
                </div>
              ) : filteredAvailableFriends.length === 0 ? (
                <div className="text-center py-8 px-4 text-xs text-gray-400">
                  No friends found matching &quot;{friendSearch}&quot;
                </div>
              ) : (
                filteredAvailableFriends.map((friend) => {
                  const isSelected = selectedFriends.includes(friend._id);
                  return (
                    <div
                      key={friend._id}
                      onClick={() => handleToggleFriend(friend._id)}
                      className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer border transition ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500/40"
                          : "bg-gray-50/50 dark:bg-white/5 border-transparent hover:border-gray-200 dark:hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <img
                            src={
                              friend.avatar?.url ||
                              friend.avatar ||
                              "https://via.placeholder.com/150"
                            }
                            alt={friend.name}
                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                            {friend.name}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate">
                            @{friend.username || "user"}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition border ${
                          isSelected
                            ? "bg-cyan-500 border-cyan-500 text-white"
                            : "border-gray-300 dark:border-white/20 bg-white dark:bg-[#161822]"
                        }`}
                      >
                        {isSelected && <FaCheck className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3 bg-gray-50/50 dark:bg-white/5">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {selectedFriends.length} selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setSelectedFriends([]);
                    setFriendSearch("");
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleAddMembersSubmit}
                  disabled={
                    selectedFriends.length === 0 ||
                    addingMembersLoading?.isLoading
                  }
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition flex items-center gap-1.5 ${
                    selectedFriends.length === 0 ||
                    addingMembersLoading?.isLoading
                      ? "bg-cyan-500/40 cursor-not-allowed"
                      : "bg-cyan-500 hover:bg-cyan-600 active:scale-95 cursor-pointer shadow-cyan-500/20"
                  }`}
                >
                  {addingMembersLoading?.isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <HiUserPlus className="w-4 h-4" />
                      <span>Add ({selectedFriends.length})</span>
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

export default GroupInfo;
