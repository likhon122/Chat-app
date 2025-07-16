import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { FaRegComments } from "react-icons/fa";

import MyChats from "./MyChats";
import { setMessageNotification } from "../../app/features/chatSlice";
import { useGetSocket } from "../../SocketHelper";
import { setShowSearch } from "../../app/features/otherSlice";

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

  useEffect(() => {
    dispatch(setShowSearch(true));
  }, [dispatch]);

  return (
    <div className="h-[92vh] bg-gray-50 dark:bg-gray-900 p-4 ">
      <motion.div
        className="h-full flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Chat List */}
        <motion.div
          className="md:w-80 mt-10 md:mt-0  w-full flex-shrink-0 mr-4"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <MyChats />
        </motion.div>

        {/* Empty State */}
        <motion.div
          className="flex-1 bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg hidden md:flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full mx-auto flex items-center justify-center mb-4">
              <FaRegComments className="text-blue-500 text-3xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Select a conversation
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Choose a chat from the list to start messaging or continue a
              conversation
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ShowChat;
