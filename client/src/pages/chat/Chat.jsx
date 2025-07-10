import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import GroupChatNav from "./GroupChatNav";
import GroupInfo from "./GroupInfo";
import Message from "./message/Message";
import MyChats from "./MyChats";

const Chat = () => {
  const { groupInfoDrawer } = useSelector((state) => state.other);
  const params = useParams();
  const { chatId } = params;

  return (
    <div className="w-full h-[92vh] bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile Layout */}
      <div className="md:hidden h-full flex flex-col">
        <div className="flex-shrink-0">
          <GroupChatNav chatId={chatId} />
        </div>

        <div className="flex-1 h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {groupInfoDrawer ? (
              <motion.div
                key="group-info"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-y-auto"
              >
                <GroupInfo chatId={chatId} />
              </motion.div>
            ) : (
              <motion.div
                key="message-area"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Message chatId={chatId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex h-full p-3">
        <div
          className={`flex w-full h-full gap-4 ${
            groupInfoDrawer ? "pr-0" : ""
          }`}
        >
          {/* Chat List */}
          <div className="w-[350px] flex-shrink-0">
            <MyChats />
          </div>

          {/* Chat Area */}
          <div
            className={`flex-1 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm ${
              groupInfoDrawer &&
              !window.matchMedia("(min-width: 1280px)").matches
                ? "hidden"
                : ""
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="flex-shrink-0">
                <GroupChatNav chatId={chatId} />
              </div>
              <div className="flex-1 overflow-hidden">
                <Message chatId={chatId} />
              </div>
            </div>
          </div>

          {/* Group Info */}
          <AnimatePresence>
            {groupInfoDrawer && (
              <motion.div
                className={`w-[350px] flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm`}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 350 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GroupInfo chatId={chatId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Chat;
