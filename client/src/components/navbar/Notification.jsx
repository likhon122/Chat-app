import { useCallback, useRef } from "react";
import { IoMdNotifications } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { setNotificationDrawer } from "../../app/features/otherSlice";
import NotificationDrawer from "../notification/NotificationDrawer";
import { getSocket } from "../../Socket";
import { useSocketHook } from "../../hooks/useSocketHook";
import { NEW_FRIEND_REQUEST } from "../../constants/event";
import { setRequestNotificationCount } from "../../app/features/chatSlice";
import useClickOutside from "../../hooks/useClickOutsideHook";

const Notification = () => {
  const drawerToggle = useSelector((state) => state.other.notificationDrawer);
  const { requestNotification } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const socket = getSocket();
  const drawerRef = useRef(null);

  const newRequestHandler = useCallback(() => {
    dispatch(setRequestNotificationCount());
  }, [dispatch]);

  const eventHandlers = { [NEW_FRIEND_REQUEST]: newRequestHandler };

  useSocketHook(socket, eventHandlers);

  const handleClick = () => {
    dispatch(setNotificationDrawer(!drawerToggle));
  };

  useClickOutside(drawerRef, () => {
    if (drawerToggle) {
      dispatch(setNotificationDrawer(false));
    }
  });

  return (
    <div className="relative">
      <div
        className="text-[#7D8ABC] dark:text-[#7D8ABC] cursor-pointer transition-transform transform hover:scale-105"
        onClick={handleClick}
        aria-label="Notifications"
      >
        <div className="relative">
          {requestNotification > 0 && (
            <div className="absolute top-[-10px]  right-[-10px] bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {requestNotification}
            </div>
          )}
          <IoMdNotifications  className="text-xl sm:text-2xl"/>
        </div>
      </div>

      {/* Notification Drawer */}
      {drawerToggle && (
        <div
          className={`absolute  w-80 right-[-33px]  sm:right-0 top-14 md:w-[400px] max-h-[100vh]  sm:top-11 transition-transform duration-500 
            "
          }`}
          ref={drawerRef}
        >
          <div className="bg-white dark:bg-[#222222] w-full md:w-[400px] max-h-[100vh] overflow-y-auto p-4 shadow-lg rounded-lg ">
            <NotificationDrawer onClose={handleClick} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
