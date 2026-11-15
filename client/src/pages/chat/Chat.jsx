import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import GroupChatNav from "./GroupChatNav";
import GroupInfo from "./GroupInfo";
import Message from "./message/Message";
import MyChats from "./MyChats";
import { useEffect } from "react";
import { setShowSearch } from "../../app/features/otherSlice";

const Chat = () => {
  const showSearch = useSelector((state) => state.other.search);
  const { groupInfoDrawer } = useSelector((state) => state.other);
  const params = useParams();
  const { chatId } = params;
  const dispatch = useDispatch();

  useEffect(() => {
    if (showSearch && !window.matchMedia("(min-width: 768px)").matches) {
      dispatch(setShowSearch(false));
    }
  }, [dispatch, showSearch]);

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-[#0c0d12] overflow-hidden p-1 sm:p-2">
      {/* Mobile Layout (< md) */}
      <div className="md:hidden h-full flex flex-col bg-white dark:bg-[#12131a] rounded-2xl overflow-hidden border border-gray-200/80 dark:border-white/10 shadow-xl">
        <div className="flex-shrink-0">
          <GroupChatNav chatId={chatId} />
        </div>

        <div className="flex-1 min-h-0 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {groupInfoDrawer ? (
              <motion.div
                key="group-info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-y-auto"
              >
                <GroupInfo chatId={chatId} />
              </motion.div>
            ) : (
              <motion.div
                key="message-area"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
              >
                <Message chatId={chatId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop Layout (>= md) - Full Width Screen Utilization */}
      <div className="hidden md:flex h-full w-full gap-2">
        {/* Sidebar Chat List */}
        <div className="w-[290px] lg:w-[330px] flex-shrink-0 h-full">
          <MyChats />
        </div>

        {/* Center Chat Area */}
        <div className="flex-1 bg-white dark:bg-[#12131a] rounded-2xl overflow-hidden border border-gray-200/80 dark:border-white/10 shadow-xl flex flex-col min-w-0 h-full">
          <div className="flex-shrink-0">
            <GroupChatNav chatId={chatId} />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <Message chatId={chatId} />
          </div>
        </div>

        {/* Right Info Drawer (Desktop) */}
        <AnimatePresence>
          {groupInfoDrawer && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 310 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex-shrink-0 h-full overflow-hidden"
            >
              <div className="w-[310px] h-full">
                <GroupInfo chatId={chatId} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Chat;
