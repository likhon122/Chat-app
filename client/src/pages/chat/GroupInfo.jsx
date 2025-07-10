import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IoMdExit,
  IoIosArrowBack,
  IoMdPeople,
  IoMdTime,
  IoMdTrash
} from "react-icons/io";
import {
  useDeleteGroupMutation,
  useGetGroupDetailsQuery,
  useLeaveGroupMutation
} from "../../app/api/api";
import { timeSince } from "../../helper/timeSince";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import { setGroupInfoDrawer } from "../../app/features/otherSlice";

const GroupInfo = ({ chatId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const { data, isError, isLoading } = useGetGroupDetailsQuery(chatId);
  const [leaveGroup, leaveGroupLoading] = useAsyncMutation(
    useLeaveGroupMutation
  );
  const [deleteChat, deleteChatLoading] = useAsyncMutation(
    useDeleteGroupMutation
  );

  const created = timeSince(data?.payload?.chat.createdAt);

  const leaveGroupHandler = () => {
    leaveGroup("Leaving group...", chatId);
  };

  const removeFriendAndDeleteChatHandler = () => {
    deleteChat("Deleting chat and unfriend...", chatId);
  };

  useEffect(() => {
    if (leaveGroupLoading.success || deleteChatLoading.success) {
      navigate("/chat");
    }
  }, [leaveGroupLoading, navigate, deleteChatLoading]);

  if (isLoading) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="h-full flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="mt-8 w-48 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center">
        <div className="text-center text-red-500 p-6">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-medium">Error Loading</h3>
          <p className="mt-2">
            Something went wrong while loading the chat info.
          </p>
        </div>
      </div>
    );
  }

  const chat = data?.payload?.chat;
  const isGroupChat = chat?.groupChat;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg flex flex-col"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center">
          <button
            onClick={() => dispatch(setGroupInfoDrawer(false))}
            className="md:hidden mr-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <IoIosArrowBack
              size={18}
              className="text-gray-600 dark:text-gray-300"
            />
          </button>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            {isGroupChat ? "Group Info" : "Chat Info"}
          </h2>
        </div>

        {isGroupChat ? (
          <button
            onClick={leaveGroupHandler}
            disabled={leaveGroupLoading.isLoading}
            className="flex items-center space-x-1 py-1 px-3 rounded-full text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            {leaveGroupLoading.isLoading ? (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Leaving...</span>
              </div>
            ) : (
              <>
                <IoMdExit size={14} />
                <span>Leave Group</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={removeFriendAndDeleteChatHandler}
            disabled={deleteChatLoading.isLoading}
            className="flex items-center space-x-1 py-1 px-3 rounded-full text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            {deleteChatLoading.isLoading ? (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Deleting...</span>
              </div>
            ) : (
              <>
                <IoMdTrash size={14} />
                <span>Delete Chat</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Profile */}
      <div className="flex flex-col items-center py-8 px-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        {isGroupChat ? (
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full p-1 shadow-lg mb-4">
            <div className="relative w-full h-full grid grid-cols-2 rounded-full overflow-hidden border-2 border-white dark:border-gray-800">
              {chat.members.slice(0, 3).map((member, index) => (
                <img
                  key={member._id}
                  src={member.avatar}
                  alt={member.name}
                  className={`object-cover ${
                    index === 2 ? "col-span-2" : ""
                  } w-full h-full`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg mb-4">
            {chat.members.filter((member) => member._id !== user._id)[0] && (
              <img
                src={
                  chat.members.filter((member) => member._id !== user._id)[0]
                    .avatar
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}

        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">
          {isGroupChat
            ? chat.chatName
            : chat.chatName.split("-").filter((name) => name !== user.name)[0]}
        </h3>

        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
          <IoMdTime className="mr-1" />
          <span>Created {created}</span>
        </div>

        <div className="flex items-center mt-6 space-x-4">
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {chat.members.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Members
            </div>
          </div>

          {isGroupChat && (
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {chat.messages?.length || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Messages
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="py-4">
          <div className="flex items-center mb-3">
            <IoMdPeople className="text-blue-500 dark:text-blue-400 mr-2" />
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">
              Members
            </h4>
            <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
              {chat.members.length}{" "}
              {chat.members.length === 1 ? "person" : "people"}
            </div>
          </div>

          <div className="space-y-2">
            {chat.members.map((member) => (
              <Link
                to={`/profile/${member._id}`}
                key={member._id}
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div className="ml-3">
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {member.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {member._id === user._id
                      ? "You"
                      : "@" + (member.username || "username")}
                  </div>
                </div>

                {member._id === user._id && (
                  <div className="ml-auto py-0.5 px-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
                    You
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GroupInfo;
