import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { FaRegComments, FaShieldAlt, FaBolt, FaVideo } from "react-icons/fa";
import { HiChatBubbleLeftRight, HiSparkles } from "react-icons/hi2";
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
    <div className="w-full h-full bg-gray-50 dark:bg-[#0c0d12] p-1 sm:p-2 overflow-hidden">
      <div className="h-full flex w-full gap-2">
        {/* Sidebar Chat List */}
        <div className="w-full md:w-[290px] lg:w-[330px] flex-shrink-0 h-full">
          <MyChats />
        </div>

        {/* Modern Empty State (Desktop) */}
        <div className="hidden md:flex flex-1 bg-white dark:bg-[#12131a] rounded-2xl overflow-hidden border border-gray-200/80 dark:border-white/10 shadow-xl flex-col items-center justify-center p-8 text-center relative">
          {/* Subtle ambient accent */}
          <div className="absolute w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#16222A] via-[#1c2e3d] to-[#26a0da] p-0.5 shadow-2xl mb-6">
            <div className="w-full h-full bg-[#12131a] rounded-[22px] flex items-center justify-center text-cyan-400">
              <HiChatBubbleLeftRight className="w-10 h-10" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            Select a Conversation
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-8">
            Choose a contact or group from the left to start sending real-time messages, media, and voice calls.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-md">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-gray-300">
              <FaShieldAlt className="text-cyan-500" />
              <span>End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-gray-300">
              <FaBolt className="text-amber-500" />
              <span>Instant WebSockets</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-gray-300">
              <FaVideo className="text-purple-500" />
              <span>WebRTC Voice & Video</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowChat;
