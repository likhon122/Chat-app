// import React from 'react'
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import MyChats from "./MyChats";
import { setMessageNotification } from "../../app/features/chatSlice";
import { getSocket } from "../../Socket";

const ShowChat = () => {
  const userData = useSelector((state) => state.auth.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = getSocket();

  useEffect(() => {
    if (!userData) {
      navigate("/sign-up");
    }
  }, [userData, navigate]);

  useEffect(() => {
    const newMessageAlertHandler = (data) => {
      dispatch(setMessageNotification(data));
    };

    socket.on("NEW_MESSAGE_ALERT", newMessageAlertHandler);

    return () => {
      socket.off("NEW_MESSAGE_ALERT", newMessageAlertHandler);
    };
  }, [dispatch, socket]);

  // useEffect(() => {
  //   console.log("Message Notification:", messageNotification);
  // }, [messageNotification]);

  return (
    <div>
      <div className="grid grid-cols-2">
        <div className="border border-black">
          <MyChats />
        </div>
        <div className="border border-black">
          <div className="flex items-center justify-center h-screen">
            <h1>Please select any chat!!!</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowChat;
