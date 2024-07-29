// import React from 'react'

import axios from "axios";
import { useGetChatsQuery } from "../../app/api/api";
import { serverUrl } from "../../..";

const MyChats = () => {
  const { data, isError, isLoading, error } = useGetChatsQuery();

  if (isLoading) {
    return (
      <div>
        <h1>Loading...</h1>
        
      </div>
    );
  }

  return (
    <div>
      {data &&
        data.payload.allChats.map((chat) => {
          if (!chat.groupChat) {
            return (
              <article
                key={chat._id}
                className="border border-black hover:bg-slate-300 cursor-pointer"
              >
                <div>
                  <img
                    src={chat.avatar}
                    className="rounded-full w-[50px] h-[50px]"
                  />
                  <h2>{chat.chatName}</h2>
                </div>
              </article>
            );
          } else {
            return (
              <article
                key={chat._id}
                className="border border-black hover:bg-slate-300 cursor-pointer"
              >
                <div className="">
                  <div className="flex">
                    {chat.avatar.map((avatar, index) => (
                      <div key={index} className="">
                        <img
                          src={avatar}
                          className="rounded-full w-[50px] h-[50px]"
                        />
                      </div>
                    ))}
                  </div>
                  <h2>{chat.chatName}</h2>
                </div>
              </article>
            );
          }
        })}
    </div>
  );
};

export default MyChats;
