import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaTimes, FaBell, FaUserFriends } from "react-icons/fa";

import { FaXmark } from "react-icons/fa6";
import {
  useAcceptFriendRequestMutation,
  useFriendRequestNotificationQuery,
  useRejectFriendRequestMutation
} from "../../app/api/api";
import { toast } from "react-toastify";

const NotificationDrawer = ({ onClose }) => {
  const { data, isLoading, error, refetch } =
    useFriendRequestNotificationQuery();
  const [acceptFriendRequest, { isLoading: isAccepting }] =
    useAcceptFriendRequestMutation();
  const [rejectFriendRequest, { isLoading: isRejecting }] =
    useRejectFriendRequestMutation();
  const [processingIds, setProcessingIds] = useState([]);

  const handleConfirmRequest = async (id) => {
    try {
      setProcessingIds((prev) => [...prev, id]);
      await acceptFriendRequest({ acceptId: id }).unwrap();
      toast.success("Friend request accepted!");
      refetch();
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setProcessingIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      setProcessingIds((prev) => [...prev, id]);
      await rejectFriendRequest({ deleteId: id }).unwrap();
      toast.success("Friend request rejected!");
      refetch();
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setProcessingIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const requestCount = data?.payload?.friendRequests?.length || 0;

  console.log(requestCount);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white dark:bg-gray-800 overflow-hidden rounded-xl shadow-2xl"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750">
        <div className="flex items-center">
          <div className="bg-blue-500/10 dark:bg-blue-500/20 p-2 rounded-lg mr-3">
            <FaBell className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Notifications
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {requestCount > 0
                ? `You have ${requestCount} friend request${
                    requestCount > 1 ? "s" : ""
                  }`
                : "No new notifications"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close drawer"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <FaXmark size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[450px] p-4">
        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">
                Loading notifications...
              </p>
            </div>
          </div>
        ) : !error && data?.payload?.friendRequests?.length > 0 ? (
          <AnimatePresence>
            {data.payload.friendRequests.map(({ _id, sender }, index) => (
              <motion.div
                key={_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="mb-3 last:mb-0"
              >
                <div className="bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                    {/* User avatar and info */}
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="relative">
                        <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm">
                          <img
                            src={sender.avatar}
                            alt={sender.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5 border-2 border-white dark:border-gray-800">
                          <FaUserFriends className="text-white text-[10px]" />
                        </div>
                      </div>
                      <div className="ml-3 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {sender.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {sender.email}
                        </p>
                        <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                          Sent you a friend request
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 sm:flex-col md:flex-row">
                      <button
                        className={`flex-1 flex items-center justify-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                          ${
                            processingIds.includes(_id)
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-not-allowed"
                              : "bg-green-500 text-white hover:bg-green-600 dark:hover:bg-green-500"
                          }`}
                        onClick={() => handleConfirmRequest(_id)}
                        disabled={processingIds.includes(_id)}
                      >
                        {processingIds.includes(_id) ? (
                          <>
                            <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Accepting...</span>
                          </>
                        ) : (
                          <>
                            <FaCheck size={12} />
                            <span>Accept</span>
                          </>
                        )}
                      </button>

                      <button
                        className={`flex-1 flex items-center justify-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                          ${
                            processingIds.includes(_id)
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 cursor-not-allowed"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                          }`}
                        onClick={() => handleRejectRequest(_id)}
                        disabled={processingIds.includes(_id)}
                      >
                        {processingIds.includes(_id) ? (
                          <>
                            <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Declining...</span>
                          </>
                        ) : (
                          <>
                            <FaTimes size={12} />
                            <span>Decline</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <FaBell className="text-3xl text-blue-400 dark:text-blue-300 opacity-70" />
            </div>
            <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-1">
              No notifications yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
              When you receive friend requests or other notifications, they
              appear here
            </p>

            <button
              onClick={refetch}
              className="mt-5 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
            >
              Refresh Notifications
            </button>
          </div>
        )}
      </div>

      {/* Footer when notifications exist */}
      {!isLoading && data?.payload?.friendRequests?.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-750">
          <button
            onClick={refetch}
            className="text-blue-500 dark:text-blue-400 text-sm hover:text-blue-600 dark:hover:text-blue-300 font-medium"
          >
            Refresh Notifications
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationDrawer;
