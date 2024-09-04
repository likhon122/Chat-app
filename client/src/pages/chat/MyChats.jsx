import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../Socket";
import { useGetChatsQuery } from "../../app/api/api";
import { setMembers } from "../../app/features/otherSlice";
import { REFETCH_CHATS } from "../../constants/event";
import SingleSpinner from "../../components/Loaders/SingleSpinner";

const MyChats = () => {
  const messageNotification = useSelector(
    (state) => state.chat.messageNotification
  );
  const { data, isError, isLoading, refetch } = useGetChatsQuery();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = getSocket();

  const handleClick = (chat) => {
    dispatch(setMembers(chat.members));
    navigate(`/chat/${chat._id}?group-chat=${chat.groupChat}`);
  };

  const getNotificationCount = (chatId) => {
    const notification = messageNotification.find(
      (notification) => notification.chatId === chatId
    );
    return notification ? notification.count : 0;
  };

  useEffect(() => {
    const handleRefetch = (data) => {
      refetch();
    };

    socket.on(REFETCH_CHATS, handleRefetch);

    return () => {
      socket.off(REFETCH_CHATS, handleRefetch);
    };
  }, [socket, refetch]);

  if (isLoading) {
    return (
      <div className="h-full dark:bg-gray-900">
        <div className="pt-20">
          <SingleSpinner speed="animate-spin-fast" size="h-16 w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full p-4 bg-gray-100 dark:bg-gray-900">
      {data?.payload.allChats.length === 0 ? (
        <h1 className="text-gray-500 dark:text-gray-400 text-lg text-center">
          No chats available. Send a friend request!
        </h1>
      ) : (
        data?.payload?.allChats.map((chat) => {
          const notificationCount = getNotificationCount(chat._id);
          return (
            <article
              key={chat._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm mb-3 
                         transition-colors duration-300 hover:bg-blue-100 
                         hover:border-blue-300 dark:bg-gray-800 
                         dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:border-gray-600 cursor-pointer
                         sm:p-2 sm:rounded-md"
              onClick={() => handleClick(chat)}
            >
              <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 sm:p-2">
                <div className="flex items-center space-x-3">
                  {chat.groupChat ? (
                    <div className="flex -space-x-1 sm:-space-x-0.5">
                      {chat.avatar.map((avatar, index) => (
                        <img
                          key={index}
                          src={avatar}
                          alt={`avatar-${index}`}
                          className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 sm:w-8 sm:h-8"
                        />
                      ))}
                    </div>
                  ) : (
                    <img
                      src={chat.avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 sm:w-8 sm:h-8"
                    />
                  )}
                  <div className="flex flex-col">
                    <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 sm:text-base sm:font-normal">
                      {chat.chatName}
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400 sm:text-xs">
                      {chat.lastMessage || "No messages yet"}
                    </span>
                  </div>
                </div>
                {notificationCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white rounded-full px-3 py-1 text-sm sm:px-2 sm:py-0.5 sm:text-xs">
                    {notificationCount}
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
