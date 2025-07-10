import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserFriends, FaSearch, FaRegBell } from "react-icons/fa";
import { BsCircleFill } from "react-icons/bs";
import { useGetSocket } from "../../SocketHelper";
import {
  useGetChatsQuery,
  useGetNotificationsQuery,
  useGetOnlineUsersQuery,
  useMakeNotificationMutation,
  useReadNotificationMutation
} from "../../app/api/api";
import { setMembers, setSelectedChat } from "../../app/features/otherSlice";
import { NEW_MESSAGE_ALERT, REFETCH_CHATS } from "../../constants/event";
import { useSocketHook } from "../../hooks/useSocketHook";

const MyChats = () => {
  const userName = useSelector((state) => state.auth?.user?.name);
  const userId = useSelector((state) => state.auth?.user?._id);
  const isHasChatId = useSelector((state) => state.other.chatId);
  const selectedChat = useSelector((state) => state.other.selectedChat);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, refetch } = useGetChatsQuery();
  const { data: onlineUserData } = useGetOnlineUsersQuery();

  const onlineUserIds = useMemo(
    () =>
      onlineUserData?.payload?.onlineFriendsWithDetails?.length &&
      onlineUserData.payload.onlineFriendsWithDetails.map((user) => user._id),
    [onlineUserData]
  );

  const { data: getNotificationData } = useGetNotificationsQuery(userId);
  const [makeNotificationHandler] = useMakeNotificationMutation();
  const [readNotificationHandler] = useReadNotificationMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useGetSocket();

  const handleClick = (chat) => {
    dispatch(setMembers(chat.members));

    getNotificationData?.payload.length &&
      getNotificationData.payload.forEach((notification) => {
        notification.chatId === chat._id &&
          notification.count > 0 &&
          readNotificationHandler({ userId, chatId: chat._id });
      });
    dispatch(setSelectedChat(chat));
    navigate(`/chat/${chat._id}?group-chat=${chat.groupChat}`);
  };

  const getNotificationCount = (chatId) => {
    const notification = getNotificationData?.payload?.find((notification) =>
      chatId === notification.chatId ? notification : null
    );

    return notification?.count;
  };

  const isOnline = (chat) => {
    if (chat.groupChat) {
      return chat.members.some(
        (member) => onlineUserIds?.length && onlineUserIds.includes(member)
      );
    } else {
      const friendId = chat.members.find((member) => member !== userId);
      return onlineUserIds?.length && onlineUserIds.includes(friendId);
    }
  };

  const refetchHandler = useCallback(() => {
    refetch();
  }, [refetch]);

  const newMessageAlertHandler = useCallback(
    (data) => {
      if (isHasChatId === data.chatId) return;
      if (data.sender.toString() !== userId?.toString()) {
        makeNotificationHandler({ userId, chatId: data.chatId });
      }
    },
    [isHasChatId, userId, makeNotificationHandler]
  );

  const eventHandlers = {
    [REFETCH_CHATS]: refetchHandler,
    [NEW_MESSAGE_ALERT]: newMessageAlertHandler
  };

  useSocketHook(socket, eventHandlers);

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!data?.payload?.allChats) return [];

    return data.payload.allChats.filter((chat) => {
      if (chat.groupChat) {
        return chat.chatName.toLowerCase().includes(searchQuery.toLowerCase());
      } else {
        return chat.chatName
          .split("-")
          .filter((name) => name !== userName)[0]
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
    });
  }, [data?.payload?.allChats, searchQuery, userName]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg flex flex-col"
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
          Messages
        </h2>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-9 pr-4 rounded-lg bg-gray-100 dark:bg-gray-700 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-0 text-sm transition-colors"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-center space-x-3 p-3 animate-pulse"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <FaUserFriends className="text-gray-400 dark:text-gray-500 text-2xl" />
            </div>
            {searchQuery ? (
              <>
                <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                  No matches found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No conversations match your search
                </p>
              </>
            ) : (
              <>
                <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                  No conversations yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Send a friend request to start chatting!
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="py-2">
            {filteredChats.map((chat, index) => {
              const notificationCount = getNotificationCount(chat._id);
              const isSelectedChat = chat._id === selectedChat?._id;
              const isChatOnline = isOnline(chat);

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={chat._id}
                  onClick={() => handleClick(chat)}
                  className={`px-4 py-3 flex items-center cursor-pointer transition-colors ${
                    isSelectedChat
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  } relative`}
                >
                  {/* Avatar */}
                  <div className="relative">
                    {chat.groupChat ? (
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full p-0.5">
                        <div className="relative w-full h-full grid grid-cols-2 rounded-full overflow-hidden">
                          {chat.avatar.slice(0, 3).map((avatar, index) => (
                            <img
                              key={index}
                              src={avatar}
                              alt={`avatar-${index + 1}`}
                              className={`object-cover ${
                                index === 2 ? "col-span-2" : ""
                              } w-full h-full`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={chat.avatar}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Online Status */}
                    {isChatOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <h3
                        className={`font-medium truncate ${
                          notificationCount
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {chat.groupChat
                          ? chat.chatName
                          : chat.chatName
                              .split("-")
                              .filter((name) => name !== userName)[0]}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {chat.lastMessage?.time && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {new Date(chat.lastMessage.time).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit"
                              }
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <p
                        className={`text-sm truncate ${
                          notificationCount
                            ? "text-gray-800 font-medium dark:text-gray-200"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {chat.lastMessage?.lastMessage
                          ? chat.lastMessage.lastMessage
                          : chat.lastMessage?.lastAttachment?.length
                          ? "Sent an attachment"
                          : "No messages yet"}
                      </p>

                      {notificationCount > 0 && (
                        <div className="flex items-center">
                          <div className="bg-blue-500 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                            {notificationCount}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Unread Indicator */}
                  {notificationCount > 0 && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-blue-500 rounded-r-full"></div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="py-3 px-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center text-xs">
          <BsCircleFill className="text-green-500 mr-1.5 text-[8px]" />
          <span className="text-gray-600 dark:text-gray-300">
            {onlineUserIds?.length || 0} friends online
          </span>

          <button
            onClick={refetch}
            className="ml-auto flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <FaRegBell className="mr-1" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MyChats;
