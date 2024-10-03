import { useEffect } from "react";
import { useDispatch } from "react-redux";

import MyChats from "./MyChats";
import { setMessageNotification } from "../../app/features/chatSlice";
import { useGetSocket } from "../../SocketHelper";

const ShowChat = () => {
  const dispatch = useDispatch();
  const socket = useGetSocket();

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
    <div className=" grid h-[95vh] overflow-hidden grid-cols-1 md:grid-cols-[400px_1fr] gap-5 px-5 py-3 ">
      <div className="">
        <MyChats />
      </div>
      <div className="flex-1 dark:bg-[#222222]  items-center justify-center hidden md:flex dark:border-gray-600   border-gray-300 border-t-gray-300 border rounded-md shadow-md shadow-gray-300 dark:shadow-gray-600">
        <h1 className="dark:text-gray-300 text-gray-600 text-lg">
          Please select a chat!
        </h1>
      </div>
    </div>
  );
};

export default ShowChat;
