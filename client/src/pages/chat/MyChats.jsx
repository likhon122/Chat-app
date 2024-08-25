import axios from "axios";
import { useGetChatsQuery } from "../../app/api/api";
import { serverUrl } from "../../..";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setMembers } from "../../app/features/otherSlice";
import { useEffect, useState } from "react";

const MyChats = () => {
  const messageNotification = useSelector(
    (state) => state.chat.messageNotification
  );
  const { data, isError, isLoading, error } = useGetChatsQuery();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = (chat) => {
    dispatch(setMembers(chat.members));
    navigate(`/chat/${chat._id}`);
  };

  const getNotificationCount = (chatId) => {
    const notification = messageNotification.find(
      (notif) => notif.chatId === chatId
    );
    return notification ? notification.count : 0;
  };

  if (isLoading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="overflow-y-scroll h-[94.5vh]">
      {!data?.payload.allChats.length > 0 && (
        <h1>Please send anyone Friend request!!</h1>
      )}
      {data &&
        data?.payload?.allChats.length > 0 &&
        data?.payload?.allChats.map((chat) => {
          const notificationCount = getNotificationCount(chat._id);

          return (
            <article
              key={chat._id}
              className="border border-black hover:bg-slate-300 cursor-pointer"
              onClick={() => handleClick(chat)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {chat.groupChat ? (
                    <div className="flex">
                      {chat.avatar.map((avatar, index) => (
                        <img
                          key={index}
                          src={avatar}
                          className="rounded-full w-[50px] h-[50px]"
                        />
                      ))}
                    </div>
                  ) : (
                    <img
                      src={chat.avatar}
                      className="rounded-full w-[50px] h-[50px]"
                    />
                  )}
                  <h2 className="ml-2">{chat.chatName}</h2>
                </div>
                {notificationCount > 0 && (
                  <span className="bg-red-500 text-white rounded-full px-2 py-1 text-sm">
                    {notificationCount} new Message
                  </span>
                )}
              </div>
            </article>
          );
        })}
    </div>
  );
};

export default MyChats;
