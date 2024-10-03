import React from "react";
import { useDispatch } from "react-redux";
import { FaXmark } from "react-icons/fa6";
import {
  useAcceptFriendRequestMutation,
  useFriendRequestNotificationQuery,
  useRejectFriendRequestMutation
} from "../../app/api/api";
import { toast } from "react-toastify";
import SingleSpinner from "../Loaders/SingleSpinner";

const NotificationDrawer = ({ onClose }) => {
  const { data, isLoading, error, refetch } =
    useFriendRequestNotificationQuery();
  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [rejectFriendRequest] = useRejectFriendRequestMutation();
  const dispatch = useDispatch();

  const handleConfirmRequest = async (id) => {
    try {
      await acceptFriendRequest({ acceptId: id });
      toast.success("Friend request accepted!");
      refetch(); // Refetch after accepting the request
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await rejectFriendRequest({ deleteId: id }).unwrap();
      toast.success("Friend request rejected!");
      refetch(); // Refetch after rejecting the request
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="h-full bg-white dark:bg-[#222222] py-2 px-4 min-h-[400px] max-h-[100vh] overflow-y-auto ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Notifications
        </h2>
        <button
          onClick={onClose}
          aria-label="Close drawer"
          className="dark:text-gray-300 text-gray-500 dark:hover:text-gray-100 hover:text-gray-800 transition duration-200"
        >
          <FaXmark size={22} />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {isLoading && <SingleSpinner size="h-10 w-10" />}
        {!isLoading && !error && data?.payload?.friendRequests.length > 0 ? (
          data.payload.friendRequests.map(({ _id, sender }) => (
            <div
              key={_id}
              className="flex flex-row justify-between gap-6 items-center p-4 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex justify-center items-center gap-4 mb-4 sm:mb-0 w-full sm:w-auto">
                <img
                  src={sender.avatar}
                  alt={sender.name}
                  className="h-16 w-16 rounded-full border-2 border-gray-300 dark:border-gray-600"
                />
                <div className="flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {sender.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {sender.email}
                  </p>
                </div>
              </div>
              <div className="flex justify-center items-center gap-3 sm:mt-0">
                <button
                  className="bg-green-600 text-white py-2 px-4 sm:px-1 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                  onClick={() => handleConfirmRequest(_id)}
                >
                  Confirm
                </button>
                <button
                  className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                  onClick={() => handleRejectRequest(_id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <h3 className="text-center text-gray-300">No notifications here!</h3>
        )}
      </div>
    </div>
  );
};

export default NotificationDrawer;
