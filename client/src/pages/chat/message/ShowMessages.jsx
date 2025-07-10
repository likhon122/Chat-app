import { useEffect, useState } from "react";
import {
  FaFilePdf,
  FaReply,
  FaCode,
  FaMusic,
  FaVideo,
  FaImage,
  FaFileAlt,
  FaCheck,
  FaCheckDouble
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ShowMessages = ({
  containerRef,
  allMessages = [],
  userId,
  messageRefs,
  handleReplyMessage,
  handleShowReplyMessage,
  bottomRef,
  highlightedMessageId,
  messagePage,
  isFetching
}) => {
  const [startTouchX, setStartTouchX] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState({});
  const [swipeThreshold] = useState(50);
  const [clickedMessageId, setClickedMessageId] = useState(null);

  const handleTouchStart = (e) => {
    setStartTouchX(e.touches[0].clientX);
    setSwipeDirection({});
  };

  const handleTouchMove = (e, messageId) => {
    if (startTouchX !== null) {
      const currentTouchX = e.touches[0].clientX;
      const diffX = currentTouchX - startTouchX;

      if (Math.abs(diffX) > swipeThreshold) {
        setSwipeDirection((prev) => ({
          ...prev,
          [messageId]: diffX > 0 ? "right" : "left"
        }));
      }
    }
  };

  const handleTouchEnd = (event, messageId) => {
    if (swipeDirection[messageId]) {
      const messageToReply = allMessages.find(
        (msg) => msg._id === messageId || msg.realTimeId === messageId
      );
      if (messageToReply) {
        handleReplyMessage(messageToReply);
      }
    }
    setStartTouchX(null);
    setSwipeDirection((prev) => ({ ...prev, [messageId]: null }));
  };

  // Utility to check if two dates are more than 10 minutes apart
  const isMoreThanTenMinutes = (currentDate, previousDate) => {
    const difference = currentDate - previousDate;
    return difference > 10 * 60 * 1000; // 10 minutes in milliseconds
  };

  // Utility to check if two messages are on different days
  const isDifferentDay = (currentDate, previousDate) => {
    return (
      currentDate.getDate() !== previousDate.getDate() ||
      currentDate.getMonth() !== previousDate.getMonth() ||
      currentDate.getFullYear() !== previousDate.getFullYear()
    );
  };

  // Format time from Date object
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Format date from Date object
  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        year:
          messageDate.getFullYear() !== today.getFullYear()
            ? "numeric"
            : undefined
      });
    }
  };

  useEffect(() => {
    if (highlightedMessageId && messageRefs?.current[highlightedMessageId]) {
      messageRefs.current[highlightedMessageId].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [highlightedMessageId, messageRefs]);

  return (
    <div
      className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-gray-900 p-4"
      ref={containerRef}
    >
      {messagePage > 0 && isFetching && (
        <div className="flex justify-center my-2">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      )}

      {allMessages &&
        allMessages.length > 0 &&
        allMessages.map((message, index) => {
          const isSameSender = message.sender._id === userId;
          const messageId = message._id || message.realTimeId;
          const previousMessage = allMessages[index - 1];

          // Show date if the message is on a different day or if more than 10 minutes have passed since the previous message
          const showDate =
            index === 0 ||
            (previousMessage &&
              isDifferentDay(
                new Date(message.createdAt),
                new Date(previousMessage.createdAt)
              ));

          // Show time if this is the first message or if more than 10 minutes have passed since the previous message
          const showTime =
            index === 0 ||
            (previousMessage &&
              isMoreThanTenMinutes(
                new Date(message.createdAt),
                new Date(previousMessage.createdAt)
              ));

          // Check who replied to whom
          let whoReplied = "";
          if (message?.replyTo) {
            const repliedToUserId = message.replyTo.sender._id;
            const senderId = message.sender._id;

            if (userId === repliedToUserId && userId === senderId) {
              whoReplied = "You replied to yourself";
            } else if (userId === repliedToUserId && userId !== senderId) {
              whoReplied = `${message.sender.name} replied to you`;
            } else if (userId !== repliedToUserId && userId === senderId) {
              whoReplied = `You replied to ${message.replyTo.sender.name}`;
            } else {
              whoReplied = `${message.sender.name} replied to ${message.replyTo.sender.name}`;
            }
          }

          return (
            <div key={messageId} className="mb-3">
              {/* Date Separator */}
              {showDate && (
                <div className="flex justify-center my-4">
                  <div className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium px-4 py-1 rounded-full shadow-sm">
                    {formatDate(message.createdAt)}
                  </div>
                </div>
              )}

              {/* Message */}
              <div
                ref={(el) => {
                  if (messageId) {
                    messageRefs.current[messageId] = el;
                  }
                }}
                data-message-id={messageId}
                onTouchStart={handleTouchStart}
                onTouchMove={(e) => handleTouchMove(e, messageId)}
                onTouchEnd={(e) => handleTouchEnd(e, messageId)}
                className={`group flex ${
                  isSameSender ? "justify-end" : "justify-start"
                } items-end mb-1.5`}
              >
                {/* Sender Avatar (only show for received messages) */}
                {!isSameSender && (
                  <div className="flex-shrink-0 mr-2">
                    <div className="relative">
                      <img
                        src={message.sender.avatar.url || message.sender.avatar}
                        alt={message.sender.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Message Content */}
                <motion.div
                  className={`flex flex-col max-w-[75%]`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Reply Message (if exists) */}
                  {message.replyTo && (
                    <div
                      onClick={() => handleShowReplyMessage(message)}
                      className={`flex items-start mb-1 cursor-pointer mx-1 ${
                        isSameSender ? "self-end" : "self-start"
                      }`}
                    >
                      <div
                        className={`
                      relative py-1.5 px-3 rounded-lg max-w-full
                      ${
                        isSameSender
                          ? "bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-600"
                          : "bg-gray-100 dark:bg-gray-800/70 border-l-4 border-gray-400 dark:border-gray-600"
                      }
                    `}
                      >
                        <div className="flex items-center mb-0.5">
                          <FaReply
                            className={`text-xs mr-1.5 ${
                              isSameSender ? "text-blue-500" : "text-gray-500"
                            }`}
                          />
                          <span
                            className={`text-xs font-medium ${
                              isSameSender
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {whoReplied}
                          </span>
                        </div>

                        {Array.isArray(message.replyTo.attachment) &&
                        message.replyTo.attachment.length > 0 ? (
                          <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                            <FaImage className="text-xs" />
                            <span>Media attachment</span>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                            {message.replyTo.content || "No text content"}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Main Message Bubble */}
                  <div
                    onClick={() =>
                      setClickedMessageId(
                        clickedMessageId === messageId ? null : messageId
                      )
                    }
                    className={`
                    relative rounded-xl shadow-sm
                    ${
                      highlightedMessageId === messageId
                        ? "ring-2 ring-blue-500 dark:ring-blue-400 transform scale-[1.02] z-10 transition-all duration-300"
                        : ""
                    }
                    ${
                      isSameSender
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-tr-md rounded-bl-xl rounded-br-xl"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-md rounded-bl-md rounded-br-xl"
                    }
                  `}
                  >
                    {isSameSender ? (
                      <>
                        <div
                          className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 -left-7 ${
                            isSameSender ? "mr-2" : "ml-2"
                          }`}
                        >
                          <button
                            onClick={() => handleReplyMessage(message)}
                            className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 shadow-sm transition-colors"
                          >
                            <FaReply size={12} />
                          </button>
                        </div>
                      </>
                    ) : null}

                    {/* Message Text Content */}
                    {message.content && (
                      <div className="px-4 py-2.5 break-words">
                        <p className="text-sm">{message.content}</p>
                      </div>
                    )}

                    {/* Attachments */}
                    {message.attachment?.length > 0 && (
                      <div
                        className={`
                      ${message.content ? "mt-1.5 mb-1 px-3" : "p-2"} 
                      ${
                        message.attachment.length > 1
                          ? "grid grid-cols-2 gap-2"
                          : ""
                      }
                    `}
                      >
                        {message.attachment.map((att, attIndex) => {
                          const fileType = getFileType(att.url);

                          return (
                            <div
                              key={att.public_id || attIndex}
                              className={`
                              rounded-lg overflow-hidden
                              ${
                                fileType === "image"
                                  ? "bg-transparent"
                                  : "bg-gray-100 dark:bg-gray-700 p-2"
                              }
                            `}
                            >
                              <AttachmentRenderer
                                attachment={att}
                                fileType={fileType}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Message Time (only show when clicked or for the latest message) */}
                    {(clickedMessageId === messageId ||
                      index === allMessages.length - 1) && (
                      <div
                        className={`absolute bottom-0 ${
                          isSameSender
                            ? "-left-2 -translate-x-full"
                            : "-right-2 translate-x-full"
                        } flex items-center`}
                      >
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatTime(message.createdAt)}
                        </span>
                        {isSameSender && (
                          <FaCheckDouble className="ml-1 text-[8px] text-blue-400" />
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Reply Button */}
                {!isSameSender ? (
                  <>
                    <div
                      className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                        isSameSender ? "mr-2" : "ml-2"
                      }`}
                    >
                      <button
                        onClick={() => handleReplyMessage(message)}
                        className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 shadow-sm transition-colors"
                      >
                        <FaReply size={12} />
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
};

// Helper function to determine file type from URL
const getFileType = (url) => {
  if (!url) return "unknown";

  const extension = url.split(".").pop().toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
    return "image";
  } else if (["mp4", "webm", "ogg", "mov"].includes(extension)) {
    return "video";
  } else if (["mp3", "wav", "ogg"].includes(extension)) {
    return "audio";
  } else if (extension === "pdf") {
    return "pdf";
  } else if (["js", "html", "css", "jsx", "ts", "tsx"].includes(extension)) {
    return "code";
  } else {
    return "file";
  }
};

// Component for rendering different types of attachments
const AttachmentRenderer = ({ attachment, fileType }) => {
  const { url } = attachment;

  switch (fileType) {
    case "image":
      return (
        <div className="relative group">
          <img
            src={url}
            className="w-full h-auto max-h-32 max-w-32 object-cover rounded-lg transform transition-transform duration-300 group-hover:scale-[1.02]"
            alt="Image attachment"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/90 text-gray-800 p-2 rounded-full hover:bg-white transition-colors"
            >
              <FaImage />
            </a>
          </div>
        </div>
      );

    case "video":
      return (
        <div className="relative rounded-lg overflow-hidden">
          <video
            className="w-full rounded-lg max-h-60"
            controls
            preload="metadata"
          >
            <source
              src={url}
              type={`video/${url.split(".").pop().toLowerCase()}`}
            />
            Your browser does not support video playback.
          </video>
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs p-1 px-2 rounded-full flex items-center">
            <FaVideo className="mr-1" />
            Video
          </div>
        </div>
      );

    case "audio":
      return (
        <div className="flex items-center space-x-3 p-1">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <FaMusic className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium mb-1">Audio File</p>
            <audio controls className="w-full h-8">
              <source
                src={url}
                type={`audio/${url.split(".").pop().toLowerCase()}`}
              />
              Your browser does not support audio playback.
            </audio>
          </div>
        </div>
      );

    case "pdf":
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="w-10 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-md flex items-center justify-center flex-shrink-0">
            <FaFilePdf className="text-white text-lg" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium mb-1">PDF Document</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {url.split("/").pop()}
            </p>
          </div>
        </a>
      );

    case "code":
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="w-10 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
            <FaCode className="text-white text-lg" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium mb-1">
              {url.split(".").pop().toUpperCase()} File
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {url.split("/").pop()}
            </p>
          </div>
        </a>
      );

    default:
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="w-10 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
            <FaFileAlt className="text-white text-lg" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium mb-1">File</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {url.split("/").pop()}
            </p>
          </div>
        </a>
      );
  }
};

export default ShowMessages;
