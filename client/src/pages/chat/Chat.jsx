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
    if (!userData) {
      navigate("/sign-up");
    }
  }, [userData, navigate]);

  return (
    <>
      <div>
        <div
          className={`${
            groupInfoDrawer
              ? "grid grid-cols-[1fr_1.3fr_.7fr]"
              : "grid grid-cols-[1fr_2fr]"
          }`}
        >
          <div className="border border-black h-[95vh]">
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
    </>
  );
};

export default Chat;
