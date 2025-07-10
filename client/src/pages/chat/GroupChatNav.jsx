import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaInfoCircle,
  FaTimes,
  // FaPhone,
  FaVideo,
  // FaUserFriends
} from "react-icons/fa";

import { setGroupInfoDrawer } from "../../app/features/otherSlice";
import { useGetGroupDetailsQuery } from "../../app/api/api";
import CallButtons from "./message/CallButtons";

const GroupChatNav = ({ chatId }) => {
  const { groupInfoDrawer } = useSelector((state) => state.other);
  const user = useSelector((state) => state.auth.user);
  const { data, isLoading, isError } = useGetGroupDetailsQuery(chatId);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInfoButton = () => {
    dispatch(setGroupInfoDrawer(!groupInfoDrawer));
  };

  const handleClick = () => {
    if (!data?.payload?.chat.groupChat) {
      const friend = data.payload.chat.members.filter(
        (member) => member._id !== user._id
      );
      navigate(`/profile/${friend[0]._id}`);
    }
  };

  useEffect(() => {
    dispatch(setGroupInfoDrawer(false));
  }, []);

  useEffect(() => {
    if (isError) {
      navigate("/chat");
      toast.error("Something went wrong!");
    }
  }, [isError, navigate]);

  const isGroupChat = data?.payload?.chat?.groupChat;
  const member = data?.payload?.chat?.members?.filter(
    (member) => member._id !== user._id
  );
  const chat = data?.payload?.chat;
  const friendMembers = chat?.members?.filter(
    (member) => member._id !== user._id
  );

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
      {/* Left Side - User/Group Info */}
      <div className="flex items-center">
        {isLoading ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center space-x-3 ${
              !isGroupChat ? "cursor-pointer" : ""
            }`}
            onClick={!isGroupChat ? handleClick : undefined}
          >
            {isGroupChat ? (
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full p-0.5 shadow-md">
                  <div className="relative w-full h-full grid grid-cols-2 rounded-full overflow-hidden border-2 border-white dark:border-gray-800">
                    {chat?.members?.slice(0, 3).map((member, index) => (
                      <img
                        key={member._id}
                        src={member.avatar}
                        alt={member.name}
                        className={`object-cover ${
                          index === 2 ? "col-span-2" : ""
                        } w-full h-full`}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3 h-3 border-2 border-white dark:border-gray-800"></div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-md">
                  {friendMembers?.[0] && (
                    <img
                      src={friendMembers[0].avatar}
                      alt={friendMembers[0].name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3 h-3 border-2 border-white dark:border-gray-800"></div>
              </div>
            )}

            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200">
                {isGroupChat
                  ? chat?.chatName
                  : chat?.chatName
                      ?.split("-")
                      ?.filter((name) => name !== user.name)[0]}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isGroupChat ? `${chat?.members?.length} members` : "Online"}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center space-x-2">
        {!isGroupChat ? (
          <div className="flex items-center">
            <CallButtons chatId={chatId} member={member} />
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              Group call coming soon
            </div>
            <div className="opacity-60 cursor-not-allowed">
              <FaVideo className="text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        )}

        <button
          onClick={handleInfoButton}
          className={`p-2 rounded-full transition-colors duration-200 ${
            groupInfoDrawer
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
          title={groupInfoDrawer ? "Close info" : "View info"}
        >
          {groupInfoDrawer ? <FaTimes /> : <FaInfoCircle />}
        </button>
      </div>
    </header>
  );
};

export default GroupChatNav;
