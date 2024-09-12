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
      setTimeout(() => {
        navigate("/sign-up");
      }, 1000);
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

  return (
    <div className=" grid  h-[95vh] grid-cols-1 md:grid-cols-[1fr_2fr]">
      <div className=" bg-gray-100 border-r border-gray-300 ">
        <MyChats />
      </div>
      <div className="flex-1 dark:bg-[#1F2937]  items-center justify-center hidden md:flex">
        <h1 className="text-gray-500 text-lg">Please select a chat!</h1>
      </div>
    </div>
  );
};

export default ShowChat;
