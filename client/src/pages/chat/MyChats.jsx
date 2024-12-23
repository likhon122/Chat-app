import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
import SingleSpinner from "../../components/Loaders/SingleSpinner";
import { useSocketHook } from "../../hooks/useSocketHook";

const MyChats = () => {
  const userName = useSelector((state) => state.auth?.user?.name);
  const userId = useSelector((state) => state.auth?.user?._id);

  const isHasChatId = useSelector((state) => state.other.chatId);
  const selectedChat = useSelector((state) => state.other.selectedChat);

  const { data, isError, isLoading, refetch } = useGetChatsQuery();
  const { data: onlineUserData, isLoading: onlineUsersLoading } =
    useGetOnlineUsersQuery();

  const onlineUserIds = useMemo(
    () =>
      onlineUserData?.payload?.onlineFriendsWithDetails?.length &&
      onlineUserData.payload.onlineFriendsWithDetails.map((user) => user._id),
    [onlineUserData]
  );

  const { data: getNotificationData, isLoading: getNotificationLoading } =
    useGetNotificationsQuery(userId);

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
    const notification = getNotificationData?.payload.find((notification) =>
      chatId === notification.chatId ? notification : null
    );

    return notification?.count;
  };

  const isOnline = (chat) => {
    if (chat.groupChat) {
      return chat.members.some(
        (member) => onlineUserIds.length && onlineUserIds.includes(member)
      );
    } else {
      const friendId = chat.members.find((member) => member !== userId);
      return onlineUserIds.length && onlineUserIds.includes(friendId);
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
    [isHasChatId]
  );

  const eventHandlers = {
    [REFETCH_CHATS]: refetchHandler,
    [NEW_MESSAGE_ALERT]: newMessageAlertHandler
  };

  useSocketHook(socket, eventHandlers);

  if (isLoading || onlineUsersLoading || getNotificationLoading) {
    return (
      <div className="h-full dark:bg-[#222222]">
        <div className="pt-20">
          <SingleSpinner speed="animate-spin-fast" size="h-16 w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-[92vh] p-4 bg-gray-100 dark:bg-darkBg border dark:border-gray-700 border-gray-300 rounded-md shadow-md shadow-gray-300 dark:shadow-gray-700 custom-scrollbar">
      {data?.payload.allChats.length === 0 ? (
        <h1 className="text-gray-500 dark:text-gray-400 text-lg text-center">
          No chats available. Send a friend request!
        </h1>
      ) : (
        data?.payload?.allChats.map((chat) => {
          const notificationCount = getNotificationCount(chat._id);
          const isSelectedChat = chat._id === selectedChat?._id;
          const isChatOnline = isOnline(chat);

          return (
            <article
              key={chat._id}
              className={`${
                isSelectedChat
                  ? "dark:border-gray-600 bg-gray-300 border-gray-300 dark:bg-gray-700"
                  : ""
              } rounded-lg shadow-sm mb-3 
                         transition-colors duration-300 hover:bg-gray-300 
                         hover:border-gray-300
                          dark:hover:bg-gray-700 dark:hover:border-gray-600 cursor-pointer
                         sm:p-2 sm:rounded-md`}
              onClick={() => handleClick(chat)}
            >
              <div className="flex items-center h-[55px] sm:h-[55px] relative">
                <div className="flex items-center space-x-3">
                  {chat.groupChat ? (
                    <div className="relative">
                      <div className="grid grid-cols-2 w-10 h-10 sm:w-12 sm:h-12 overflow-hidden rounded-full ">
                        {chat.avatar.slice(0, 3).map((avatar, index) => (
                          <img
                            key={index}
                            src={avatar}
                            alt={`avatar-${index + 1}`}
                            className={`object-cover bg-center ${
                              index === 2 ? "col-span-2" : ""
                            } w-full h-full`}
                          />
                        ))}
                      </div>
                      {isChatOnline && (
                        <span className="absolute bottom-0 right-[-5px] w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={chat.avatar}
                        alt="avatar"
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-cover bg-center sm:w-[50px] sm:h-[50px] object-cover"
                      />
                      {isChatOnline && (
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                      )}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <h2 className="text-[13px] md:text-[14px] font-medium text-gray-800 dark:text-gray-200">
                      {chat.groupChat
                        ? chat.chatName.length > 20
                          ? chat.chatName.slice(0, 20)
                          : chat.chatName
                        : chat.chatName
                            .split("-")
                            .filter((name) => name !== userName)[0]}
                    </h2>
                    <span
                      className={`text-sm ${
                        notificationCount
                          ? "dark:text-white font-bold"
                          : "dark:text-gray-400 font-thin"
                      }`}
                    >
                      {chat.lastMessage.lastMessage
                        ? chat.lastMessage.lastMessage.length > 20
                          ? chat.lastMessage.lastMessage.slice(0, 20) + "..."
                          : chat.lastMessage.lastMessage
                        : chat.lastMessage?.lastAttachment?.length
                        ? "Sent Attachment"
                        : "No messages yet"}
                    </span>
                  </div>
                </div>
                {notificationCount && (
                  <span className="ml-auto bg-red-500 text-white rounded-full px-3 py-1 text-sm sm:px-2 sm:py-0.5 sm:text-xs">
                    {getNotificationCount(chat._id)}
                  </span>
                )}
              </div>
            </article>
          );
        })
      )}
    </div>
  );
};

export default MyChats;
