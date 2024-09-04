// import React from 'react'

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import MyChats from "./MyChats";
import { getSocket } from "../../Socket";
import Message from "./Message";
import GroupChatNav from "./GroupChatNav";
import GroupInfo from "./GroupInfo";
// import Demo from "../../components/Demo";

const Chat = () => {
  const userData = useSelector((state) => state.auth.user);
  const { groupInfoDrawer } = useSelector((state) => state.other);

  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const groupChat = searchParams.get("group-chat");

  const { chatId } = params;

  useEffect(() => {
    setTimeout(() => {
      if (!userData) {
        navigate("/sign-up");
      }
    }, 2000);
  }, [userData, navigate]);

  return (
    <>
      <div className="md:block hidden">
        <div
          className={` ${
            groupInfoDrawer
              ? "md:grid grid-cols-[1fr_1.3fr_.7fr]"
              : "md:grid grid-cols-[1fr_2fr]"
          }`}
        >
          <div className="border border-black h-[93.9vh] ">
            <MyChats />
          </div>
          <div className="border border-black ">
            <GroupChatNav chatId={chatId} />
            <Message chatId={chatId} />
          </div>
          {groupInfoDrawer && (
            <div className="border border-black ">
              <GroupInfo chatId={chatId} />
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden block">
        <div className={``}>
          <div className="border border-black ">
            <GroupChatNav chatId={chatId} />
            {groupInfoDrawer ? (
              <div className="border border-black ">
                <GroupInfo chatId={chatId} />
              </div>
            ) : (
              <Message chatId={chatId} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
