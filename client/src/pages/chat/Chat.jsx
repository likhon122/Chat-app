// import React from 'react'

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import MyChats from "./MyChats";

const Chat = () => {
  const userData = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
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
            {/* <MyChats /> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
