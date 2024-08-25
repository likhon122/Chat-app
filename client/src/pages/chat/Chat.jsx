// import React from 'react'

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import MyChats from "./MyChats";
import { getSocket } from "../../Socket";
import Message from "./Message";
// import Demo from "../../components/Demo";

const Chat = () => {
  const userData = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const params = useParams();

  const { chatId } = params;

  useEffect(() => {
    if (!userData) {
      navigate("/sign-up");
    }
  }, [userData, navigate]);

  return (
    <>
      <div>
        <div className="grid grid-cols-2">
          <div className="border border-black ">
            <MyChats />
          </div>
          <div className="border border-black ">
            <Message chatId={chatId} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
