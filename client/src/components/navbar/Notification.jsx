import { useCallback, useRef, useState, useEffect } from "react";
import { BsBellFill } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setNotificationDrawer } from "../../app/features/otherSlice";
import NotificationDrawer from "../notification/NotificationDrawer";
import { useGetSocket } from "../../SocketHelper";
import { useSocketHook } from "../../hooks/useSocketHook";
import { NEW_FRIEND_REQUEST } from "../../constants/event";
import { setRequestNotificationCount } from "../../app/features/chatSlice";
import useClickOutside from "../../hooks/useClickOutsideHook";
import {
  useGetFriendRequestNotificationCountQuery,
  useReadFriendRequestNotificationMutation
} from "../../app/api/api";

const Notification = () => {
  const drawerToggle = useSelector((state) => state.other.notificationDrawer);
  const userId = useSelector((state) => state.auth.user?._id);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const { data, refetch } = useGetFriendRequestNotificationCountQuery(
    undefined,
    {
      refetchOnFocus: true,
      refetchOnReconnect: true
    }
  );

  const [readFriendRequestNotification] =
    useReadFriendRequestNotificationMutation();

  const dispatch = useDispatch();
  const socket = useGetSocket();
  const drawerRef = useRef(null);
  const buttonRef = useRef(null);

  // Animation for new notification arrival
  useEffect(() => {
    if (data?.payload.count > 0) {
      setHasNewNotification(true);
      const timer = setTimeout(() => setHasNewNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [data?.payload.count]);

  const newRequestHandler = useCallback(() => {
    dispatch(setRequestNotificationCount());
    if (userId) {
      readFriendRequestNotification({ userId });
      refetch();
      setHasNewNotification(true);
      setTimeout(() => setHasNewNotification(false), 3000);
    }
  }, [dispatch, userId, readFriendRequestNotification, refetch]);

  const eventHandlers = { [NEW_FRIEND_REQUEST]: newRequestHandler };

  useSocketHook(socket, eventHandlers);

  const handleClick = () => {
    dispatch(setNotificationDrawer(!drawerToggle));
    if (userId && drawerToggle === false) {
      readFriendRequestNotification({ userId });
    }
  };

  useClickOutside(drawerRef, (e) => {
    if (drawerToggle && !buttonRef.current?.contains(e.target)) {
      dispatch(setNotificationDrawer(false));
    }
  });

  const notificationCount = data?.payload.count || 0;

  return (
    <div className="relative" aria-label="Notifications">
      <motion.div
        ref={buttonRef}
        initial={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        className={`relative p-2 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 ${
          drawerToggle
            ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/50"
            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
        }`}
        onClick={handleClick}
        title="Notifications"
        aria-expanded={drawerToggle}
        aria-controls="notification-drawer"
      >
        <motion.div
          animate={{
            rotate: hasNewNotification ? [0, -10, 10, -10, 10, 0] : 0
          }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <BsBellFill
            className={`text-xl ${
              notificationCount > 0 ? "text-blue-600 dark:text-blue-400" : ""
            }`}
          />
        </motion.div>

        <AnimatePresence>
          {notificationCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1"
            >
              <div className="flex items-center justify-center">
                <span className="relative flex h-6 w-6">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                      hasNewNotification
                        ? "bg-red-400 opacity-75"
                        : "bg-transparent opacity-0"
                    }`}
                  ></span>
                  <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 text-white text-xs font-medium items-center justify-center shadow-sm">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Notification Drawer */}
      <AnimatePresence>
        {drawerToggle && (
          <motion.div
            ref={drawerRef}
            id="notification-drawer"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 right-0 top-[calc(100%+8px)] origin-top-right"
          >
            <div className="relative">
              {/* Triangle Pointer */}
              <div className="absolute right-4 -top-2 w-4 h-4 bg-white dark:bg-gray-800 transform rotate-45 border-t border-l border-gray-200 dark:border-gray-700"></div>

              {/* Drawer Content */}
              <div className="w-80 sm:w-96 max-h-[80vh] overflow-hidden rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative">
                <div className="max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  <NotificationDrawer onClose={handleClick} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notification;
