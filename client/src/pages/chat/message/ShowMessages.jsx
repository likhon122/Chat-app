import { useEffect, useMemo, useState } from "react";
import {
  FaFilePdf,
  FaReply,
  FaCode,
  FaMusic,
  FaVideo,
  FaImage,
  FaFileAlt,
  FaCheck,
  FaCheckDouble,
  FaPhone,
  FaPhoneSlash,
  FaTrash
} from "react-icons/fa";
import { useCall } from "../../../context/CallContext";
import { useDeleteSingleMessageMutation } from "../../../app/api/api";
import { toast } from "../../../utils/alert";

const truncateReplyText = (text, maxLength = 65) => {
  if (!text || typeof text !== "string") return "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).trim() + "...";
};

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
  isFetching,
  onDeleteMessage,
  realtimeOnlineIds,
  recipient
}) => {
  const [startTouchX, setStartTouchX] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState({});
  const swipeThreshold = 50;
  const [clickedMessageId, setClickedMessageId] = useState(null);
  const { initiateCall } = useCall();
  const [deleteSingleMessageApi] = useDeleteSingleMessageMutation();

  const handleDeleteForMe = async (msg) => {
    const targetId = msg._id || msg.realTimeId;
    if (!targetId) return;

    try {
      if (onDeleteMessage) {
        onDeleteMessage(msg);
      }
      await deleteSingleMessageApi(targetId).unwrap();
      toast.success("Message deleted for you");
    } catch (err) {
      console.error("Failed to delete message:", err);
      toast.error("Could not delete message");
    }
  };

  const handleCallBack = (msg, isSameSender) => {
    const isVideo =
      msg.callInfo?.callType === "video" ||
      msg.content?.toLowerCase().includes("video");
    const targetUserId = isSameSender
      ? msg.chat || msg.chatId
      : msg.sender?._id;
    const targetUserName = msg.sender?.name || "Friend";
    const targetUserAvatar = msg.sender?.avatar || "";

    initiateCall({
      chatId: msg.chatId || msg.chat,
      callType: isVideo ? "video" : "audio",
      to: targetUserId,
      toName: targetUserName,
      toImage: targetUserAvatar,
      members: [targetUserId]
    });
  };

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

  const isDifferentDay = (currentDate, previousDate) => {
    return (
      currentDate.getDate() !== previousDate.getDate() ||
      currentDate.getMonth() !== previousDate.getMonth() ||
      currentDate.getFullYear() !== previousDate.getFullYear()
    );
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

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

  const lastSentMessageIndex = useMemo(() => {
    if (!allMessages || allMessages.length === 0) return -1;
    for (let i = allMessages.length - 1; i >= 0; i--) {
      if (allMessages[i]?.sender?._id === userId) {
        return i;
      }
    }
    return -1;
  }, [allMessages, userId]);

  return (
    <div
      className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-5 space-y-3"
      ref={containerRef}
    >
      {messagePage > 0 && isFetching && (
        <div className="flex justify-center my-2">
          <div className="w-6 h-6 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        </div>
      )}

      {allMessages &&
        allMessages.length > 0 &&
        allMessages.map((msg, index) => {
          const isSameSender = msg.sender?._id === userId;
          const messageId = msg._id || msg.realTimeId;
          const previousMessage = allMessages[index - 1];

          const recipientId = recipient?._id;
          const recipientName = recipient?.name || "Friend";
          const recipientAvatar =
            recipient?.avatar?.url ||
            recipient?.avatar ||
            "https://via.placeholder.com/150";

          const isRecipientOnline = Boolean(
            recipientId && realtimeOnlineIds?.has(recipientId.toString())
          );

          // Strictly identify real call log messages
          const isCallMessage = Boolean(
            (msg.callInfo && msg.callInfo.callType) ||
            (typeof msg.content === "string" && (
              msg.content.includes(" Call •") ||
              msg.content.includes("Audio Call •") ||
              msg.content.includes("Video Call •") ||
              msg.content.startsWith("Missed Audio Call") ||
              msg.content.startsWith("Missed Video Call") ||
              msg.content.startsWith("Declined Audio Call") ||
              msg.content.startsWith("Declined Video Call")
            ))
          );

          // Read/Seen resolution
          const readByList = Array.isArray(msg.readBy) ? msg.readBy : [];
          const isSeenByRecipient = recipientId
            ? readByList.some(
                (u) => (u?._id || u).toString() === recipientId.toString()
              )
            : readByList.length > 0;
          const isSeen =
            msg.status === "seen" || isSeenByRecipient || readByList.length > 0;

          let viewerAvatar = recipientAvatar;
          let viewerName = recipientName;
          if (readByList.length > 0) {
            const firstReader = readByList[0];
            viewerAvatar =
              firstReader.avatar?.url || firstReader.avatar || recipientAvatar;
            viewerName = firstReader.name || recipientName;
          }

          const isDelivered =
            !isSeen && (msg.status === "delivered" || isRecipientOnline);
          const isSent = !isSeen && !isDelivered;
          const isLastSentMessage = isSameSender && index === lastSentMessageIndex;

          const showDate =
            index === 0 ||
            (previousMessage &&
              isDifferentDay(
                new Date(msg.createdAt),
                new Date(previousMessage.createdAt)
              ));

          let whoReplied = "";
          if (msg.replyTo) {
            const repliedToUserId = msg.replyTo.sender?._id;
            const senderId = msg.sender?._id;

            if (userId === repliedToUserId && userId === senderId) {
              whoReplied = "You replied to yourself";
            } else if (userId === repliedToUserId && userId !== senderId) {
              whoReplied = `${msg.sender?.name || "Friend"} replied to you`;
            } else if (userId !== repliedToUserId && userId === senderId) {
              whoReplied = `You replied to ${msg.replyTo.sender?.name || "Friend"}`;
            } else {
              whoReplied = `${msg.sender?.name || "Friend"} replied to ${msg.replyTo.sender?.name || "Friend"}`;
            }
          }

          return (
            <div key={messageId || index} className="space-y-2">
              {/* Day Separator Pill */}
              {showDate && (
                <div className="flex justify-center my-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-gray-200/70 dark:bg-white/10 text-gray-600 dark:text-gray-300 backdrop-blur-sm shadow-sm">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
              )}

              {/* Message Bubble Item */}
              <div
                ref={(el) => {
                  if (messageId && messageRefs?.current) {
                    messageRefs.current[messageId] = el;
                  }
                }}
                data-message-id={messageId}
                onTouchStart={handleTouchStart}
                onTouchMove={(e) => handleTouchMove(e, messageId)}
                onTouchEnd={(e) => handleTouchEnd(e, messageId)}
                className={`group flex items-end gap-1.5 sm:gap-2 ${
                  isSameSender ? "justify-end" : "justify-start"
                }`}
              >
                {/* Received sender avatar */}
                {!isSameSender && (
                  <div className="flex-shrink-0 mb-1">
                    <img
                      src={
                        msg.sender?.avatar?.url ||
                        msg.sender?.avatar ||
                        "https://via.placeholder.com/150"
                      }
                      alt={msg.sender?.name || "Avatar"}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200 dark:border-white/10 shadow-sm"
                    />
                  </div>
                )}

                {/* Left Side (For Sent Messages): Hover Time + Delivery Receipt + Quick Reply + Delete for Me */}
                {isSameSender && (
                  <div
                    className={`flex items-center gap-1.5 flex-shrink-0 self-end mb-1 transition-opacity duration-200 ${
                      clickedMessageId === messageId
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap select-none">
                      {formatTime(msg.createdAt)}
                    </span>

                    {!isCallMessage && (
                      <>
                        {isSeen ? (
                          <span
                            className="text-[10px] text-cyan-500 font-semibold"
                            title={`Seen by ${viewerName}`}
                          >
                            Seen
                          </span>
                        ) : isDelivered ? (
                          <span
                            className="text-[10px] text-cyan-500 font-medium"
                            title="Delivered"
                          >
                            <FaCheckDouble className="text-[10px]" />
                          </span>
                        ) : (
                          <span
                            className="text-[10px] text-gray-400 font-medium"
                            title="Sent"
                          >
                            <FaCheck className="text-[10px]" />
                          </span>
                        )}
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => handleReplyMessage(msg)}
                      className="p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                      title="Reply"
                    >
                      <FaReply className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteForMe(msg)}
                      className="p-1 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                      title="Delete for me"
                    >
                      <FaTrash className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}

                {/* Main Bubble Column */}
                <div className="flex flex-col max-w-[85%] sm:max-w-[70%] min-w-0">
                  {/* Quoted Reply Message */}
                  {msg.replyTo && (
                    <div
                      onClick={() => handleShowReplyMessage(msg)}
                      className={`cursor-pointer mb-1 p-2 rounded-xl text-xs border-l-2 transition max-w-full overflow-hidden ${
                        isSameSender
                          ? "bg-blue-700/60 border-white/80 text-white self-end"
                          : "bg-gray-100 dark:bg-white/5 border-gray-400 dark:border-gray-500 text-gray-600 dark:text-gray-300 self-start"
                      }`}
                    >
                      <div className="flex items-center gap-1 font-bold text-[10px] mb-0.5 truncate max-w-full">
                        <FaReply className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{whoReplied}</span>
                      </div>
                      <p className="line-clamp-1 italic text-[11px] opacity-80 truncate max-w-full break-all">
                        {truncateReplyText(msg.replyTo.content, 65) || "Media attachment"}
                      </p>
                    </div>
                  )}

                  {/* Speech Bubble - Modern Solid Background (No Gradient) */}
                  <div
                    onClick={() =>
                      setClickedMessageId(
                        clickedMessageId === messageId ? null : messageId
                      )
                    }
                    className={`relative px-4 py-2.5 shadow-sm transition-all ${
                      highlightedMessageId === messageId
                        ? "ring-2 ring-cyan-400 scale-[1.02]"
                        : ""
                    } ${
                      isSameSender
                        ? "bg-blue-600 dark:bg-blue-600 text-white rounded-2xl rounded-tr-xs"
                        : "bg-white dark:bg-[#161822] border border-gray-200/80 dark:border-white/10 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-xs"
                    }`}
                  >
                    {/* Call Log Message vs Standard Chat Bubble */}
                    {isCallMessage ? (
                      <div className="flex items-center gap-3 py-1 px-1 min-w-[210px] sm:min-w-[240px]">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                            msg.callInfo?.status === "completed" ||
                            msg.content?.includes("•")
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : msg.callInfo?.status === "missed" ||
                                msg.content?.startsWith("Missed")
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {msg.callInfo?.callType === "video" ||
                          msg.content?.toLowerCase().includes("video") ? (
                            <FaVideo className="w-4 h-4" />
                          ) : (
                            <FaPhone className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold leading-tight">
                              {msg.callInfo?.callType === "video" ||
                              msg.content?.toLowerCase().includes("video")
                                ? "Video Call"
                                : "Audio Call"}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                                msg.callInfo?.status === "completed" ||
                                msg.content?.includes("•")
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : msg.callInfo?.status === "missed" ||
                                    msg.content?.startsWith("Missed")
                                  ? "bg-rose-500/20 text-rose-300"
                                  : "bg-amber-500/20 text-amber-300"
                              }`}
                            >
                              {msg.callInfo?.status === "completed" ||
                              msg.content?.includes("•")
                                ? "Completed"
                                : msg.callInfo?.status === "missed" ||
                                  msg.content?.startsWith("Missed")
                                ? "Missed"
                                : "Declined"}
                            </span>
                          </div>

                          <p className="text-[11px] opacity-80 mt-0.5 truncate">
                            {msg.callInfo?.duration > 0
                              ? `Duration: ${Math.floor(
                                  msg.callInfo.duration / 60
                                )
                                  .toString()
                                  .padStart(2, "0")}:${(
                                  msg.callInfo.duration % 60
                                )
                                  .toString()
                                  .padStart(2, "0")}`
                              : msg.content}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCallBack(msg, isSameSender);
                          }}
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition shrink-0"
                          title="Call back"
                        >
                          {msg.callInfo?.callType === "video" ||
                          msg.content?.toLowerCase().includes("video") ? (
                            <FaVideo className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <FaPhone className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Text Content */}
                        {msg.content && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        )}

                        {/* Attachments */}
                        {msg.attachment?.length > 0 && (
                          <div
                            className={`space-y-2 ${
                              msg.content
                                ? "mt-2 pt-2 border-t border-white/10"
                                : ""
                            }`}
                          >
                            {msg.attachment.map((att, attIndex) => {
                              const fileType = getFileType(att.url);
                              return (
                                <AttachmentRenderer
                                  key={att.public_id || attIndex}
                                  attachment={att}
                                  fileType={fileType}
                                />
                              );
                            })}
                          </div>
                        )}

                        {/* Timestamp in bottom right of message text */}
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 pt-0.5 text-[10px] select-none ${
                            isSameSender
                              ? "text-white/70"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          <span>{formatTime(msg.createdAt)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Messenger-style profile avatar / status strictly below the LAST sent message */}
                  {isSameSender && !isCallMessage && isLastSentMessage && (
                    <div className="flex justify-end items-center gap-1.5 pr-1 mt-1 select-none">
                      {isSeen ? (
                        <div
                          className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500"
                          title={`Seen by ${viewerName}`}
                        >
                          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-400">
                            Seen
                          </span>
                          <img
                            src={viewerAvatar}
                            alt={viewerName}
                            className="w-4 h-4 rounded-full object-cover border border-white dark:border-[#0c0d12] shadow-sm"
                          />
                        </div>
                      ) : isDelivered ? (
                        <span
                          className="flex items-center gap-1 text-[10px] text-cyan-400 font-medium"
                          title="Delivered"
                        >
                          <FaCheckDouble className="text-[10px]" />
                          <span>Delivered</span>
                        </span>
                      ) : (
                        <span
                          className="flex items-center gap-1 text-[10px] text-gray-400 font-medium"
                          title="Sent"
                        >
                          <FaCheck className="text-[10px]" />
                          <span>Sent</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Side (For Received Messages): Quick Reply + Delete for Me + Hover Time */}
                {!isSameSender && (
                  <div
                    className={`flex items-center gap-1.5 flex-shrink-0 self-end mb-1 transition-opacity duration-200 ${
                      clickedMessageId === messageId
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleReplyMessage(msg)}
                      className="p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                      title="Reply"
                    >
                      <FaReply className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteForMe(msg)}
                      className="p-1 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                      title="Delete for me"
                    >
                      <FaTrash className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap select-none">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
};

const getFileType = (url) => {
  if (!url) return "unknown";
  const cleanUrl = url.split("?")[0].split("#")[0];
  const ext = cleanUrl.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext))
    return "image";
  if (["mp4", "webm", "ogg", "mov", "mkv", "avi"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "m4a", "aac"].includes(ext)) return "audio";
  if (ext === "pdf") return "pdf";
  if (
    [
      "js",
      "html",
      "css",
      "jsx",
      "ts",
      "tsx",
      "py",
      "json",
      "c",
      "cpp",
      "java"
    ].includes(ext)
  )
    return "code";
  return "file";
};

const AttachmentRenderer = ({ attachment, fileType }) => {
  const { url } = attachment;

  switch (fileType) {
    case "image":
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl overflow-hidden border border-white/10 group relative max-w-xs"
        >
          <img
            src={url}
            alt="Shared attachment"
            className="w-full max-h-60 object-cover group-hover:scale-105 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs font-semibold">
            Click to view
          </div>
        </a>
      );

    case "video":
      return (
        <div className="rounded-xl overflow-hidden border border-white/10 max-w-sm">
          <video controls preload="metadata" className="w-full max-h-60">
            <source src={url} />
          </video>
        </div>
      );

    case "audio":
      return (
        <div className="flex items-center gap-3 p-2 rounded-xl bg-black/20 max-w-xs">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
            <FaMusic className="w-4 h-4" />
          </div>
          <audio controls className="w-full h-8 flex-1">
            <source src={url} />
          </audio>
        </div>
      );

    case "pdf":
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20 hover:bg-black/30 transition text-left"
        >
          <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
            <FaFilePdf className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">PDF Document</p>
            <p className="text-[10px] opacity-75 truncate">{url.split("/").pop()}</p>
          </div>
        </a>
      );

    case "code":
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20 hover:bg-black/30 transition text-left"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
            <FaCode className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">Code Source</p>
            <p className="text-[10px] opacity-75 truncate">{url.split("/").pop()}</p>
          </div>
        </a>
      );

    default:
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20 hover:bg-black/30 transition text-left"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
            <FaFileAlt className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">File Attachment</p>
            <p className="text-[10px] opacity-75 truncate">{url.split("/").pop()}</p>
          </div>
        </a>
      );
  }
};

export default ShowMessages;
