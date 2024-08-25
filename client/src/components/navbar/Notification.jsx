import React, { useCallback, useState } from "react";
import { IoMdNotifications } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { setNotificationDrawer } from "../../app/features/otherSlice";
import NotificationDrawer from "../notification/NotificationDrawer";
import { getSocket } from "../../Socket";
import { useSocketHook } from "../../hooks/useSocketHook";
import { NEW_FRIEND_REQUEST, NEW_MESSAGE_ALERT } from "../../constants/event";
import {
  resetRequestNotificationCount,
  setRequestNotificationCount
} from "../../app/features/chatSlice";

const Notification = () => {
  // const [notificationDrawer, setNotificationDrawer] = useState(false);

  const drawerToggle = useSelector((state) => state.other.notificationDrawer);
  const { requestNotification } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const socket = getSocket();

  const newRequestHandler = useCallback(() => {
    console.log("Emiting");
    dispatch(setRequestNotificationCount());
  }, [dispatch]);

  const eventHandlers = { [NEW_FRIEND_REQUEST]: newRequestHandler };

  useSocketHook(socket, eventHandlers);

  const handleClick = () => {
    dispatch(setNotificationDrawer(!drawerToggle));
  };

  return (
    <>
      <div>
        <div className="cursor-pointer" onClick={handleClick}>
          <div className="relative">
            {requestNotification > 0 && (
              <div className="absolute top-[-10px] left-3 bg-red-400 px-1  rounded-full text-white">
                <h1>{requestNotification}</h1>
              </div>
            )}
            <IoMdNotifications />
          </div>
        </div>
      </div>
      {drawerToggle && <NotificationDrawer />}
    </>
  );
};

export default Notification;
