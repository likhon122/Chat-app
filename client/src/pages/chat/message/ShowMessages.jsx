import React, { useEffect, useState } from "react";
import { FaFilePdf, FaReply } from "react-icons/fa";

const ShowMessages = ({
  containerRef,
  allMessages = [],
  userId,
  messageRefs,
  handleReplyMessage,
  handleShowReplyMessage,
  bottomRef,
  highlightedMessageId,
  setHighlightedMessageId
}) => {
  const [startTouchX, setStartTouchX] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState({});
  const [swipeThreshold] = useState(50); // Define a swipe threshold

  const handleTouchStart = (e) => {
    setStartTouchX(e.touches[0].clientX);
    setSwipeDirection({}); // Reset swipe direction
  };

  const handleTouchMove = (e, messageId) => {
    if (startTouchX !== null) {
      const currentTouchX = e.touches[0].clientX;
      const diffX = currentTouchX - startTouchX;

      // Only set swipe direction if the swipe exceeds the threshold
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
      console.log("Message to reply:", messageToReply); // Debugging statement
      if (messageToReply) {
        handleReplyMessage(messageToReply);
      } else {
        console.error("Message not found:", messageId);
      }
    }
    setStartTouchX(null);
    setSwipeDirection((prev) => ({ ...prev, [messageId]: null }));
  };

  useEffect(() => {
    if (highlightedMessageId && messageRefs.current[highlightedMessageId]) {
      messageRefs.current[highlightedMessageId].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [highlightedMessageId, messageRefs]);

  return (
    <div
      className="flex-1 overflow-y-auto bg-gray-900 p-4 rounded-t-lg shadow-lg"
      ref={containerRef}
    >
      {allMessages &&
        allMessages.length > 0 &&
        allMessages.map((message) => {
          const isSameSender = message.sender._id === userId;
          const messageId = message._id || message.realTimeId;

          let whoReplied = "";

          if (message?.replyTo) {
            const repliedToUserId = message.replyTo.sender._id;
            const senderId = message.sender._id;

            if (userId === repliedToUserId && userId === senderId) {
              whoReplied = "You replied to yourself";
            } else if (userId === repliedToUserId && userId !== senderId) {
              whoReplied = `${message.replyTo.sender.name} replied to you`;
            } else {
              whoReplied = `You replied to ${message.replyTo.sender.name}`;
            }
          } else {
            whoReplied = `${message.sender.name} sent this message`;
          }

          // Define the animation class based on swipe direction for this message
          const animationClass =
            swipeDirection[messageId] === "left"
              ? "animate-swipe-left"
              : swipeDirection[messageId] === "right"
              ? "animate-swipe-right"
              : "";

          return (
            <div
              key={messageId}
              ref={(el) => {
                if (messageId) {
                  messageRefs.current[messageId] = el;
                }
              }}
              data-message-id={messageId}
              onTouchStart={handleTouchStart}
              onTouchMove={(e) => handleTouchMove(e, messageId)}
              onTouchEnd={(e) => handleTouchEnd(e, messageId)}
              className={`group flex relative ${
                isSameSender ? "justify-end" : "justify-start"
              } mb-4 ${animationClass}`}
              style={{ maxWidth: "100%" }} // Limit the width of the messages
            >
              <p
                className={`top-2 ${
                  isSameSender ? "block" : "hidden"
                } text-xs text-blue-500 cursor-pointer flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out px-2 py-1 rounded-lg z-10`}
                onClick={() => handleReplyMessage(message)}
              >
                <FaReply className="text-sm" /> Reply
              </p>

              <div className="flex flex-col">
                <div
                  onClick={() => handleShowReplyMessage(message)}
                  className="hover:cursor-pointer"
                >
                  {message.replyTo && (
                    <div
                      className={`border-l-4 border-sky-500 pl-2 bg-gray-900/70 p-2 rounded-lg shadow-sm ${
                        isSameSender ? "text-right" : "text-left"
                      }`}
                    >
                      <h3 className="font-sans font-thin text-xs text-start">
                        {whoReplied}
                      </h3>

                      {Array.isArray(message.replyTo.attachment) &&
                      message.replyTo.attachment.length > 0 ? (
                        <div className="flex items-center justify-center">
                          {message.replyTo.attachment.slice(0, 1).map((att) => {
                            const isVideo =
                              att.url.endsWith(".mp4") ||
                              att.url.endsWith(".webm") ||
                              att.url.endsWith(".ogg");
                            const isAudio =
                              att.url.endsWith(".mp3") ||
                              att.url.endsWith(".wav");
                            const isPDF = att.url.endsWith(".pdf");
                            const isCodeFile =
                              att.url.endsWith(".js") ||
                              att.url.endsWith(".html") ||
                              att.url.endsWith(".css");

                            return (
                              <div
                                key={att.public_id}
                                className="relative rounded-lg shadow-md"
                              >
                                {isVideo ? (
                                  <p>Attachment a video</p>
                                ) : isAudio ? (
                                  <p>Attachment an Audio</p>
                                ) : isPDF ? (
                                  <div className="relative">
                                    <p>Attachment a PDF</p>
                                  </div>
                                ) : isCodeFile ? (
                                  <p>Attachment a Code file</p>
                                ) : (
                                  <img
                                    src={att.url}
                                    className="h-10 w-10 object-cover"
                                    alt="Attachment"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic line-clamp-2 text-start mt-1 max-w-[200px] sm:max-w-md lg:max-w-lg min-w-20">
                          {message.replyTo.content.length > 20
                            ? message.replyTo.content.slice(0, 20) + "..."
                            : message.replyTo.content}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className={`p-4 shadow-md max-w-[200px] sm:max-w-md lg:max-w-lg min-w-20 ${
                    isSameSender
                      ? "bg-[#0B2F9F] text-white rounded-s-[1.6rem] rounded-tr-[1.6rem]"
                      : "bg-gray-700 text-gray-200 rounded-e-[1.6rem] rounded-bl-[1.6rem]"
                  } ${
                    highlightedMessageId === messageId
                      ? `border border-gray-200 transform scale-110 duration-700 ${
                          isSameSender ? "bg-cyan-900" : "bg-gray-200"
                        }`
                      : ""
                  }`}
                >
                  {!isSameSender && (
                    <h3 className="mb-1 text-sky-400 text-xs sm:text-sm font-semibold uppercase">
                      {message.sender.name}
                    </h3>
                  )}

                  <p className="break-words text-sm sm:text-base leading-relaxed">
                    {message.content}
                  </p>

                  {message.attachment?.length > 0 && (
                    <div
                      className={`grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2`}
                    >
                      {message.attachment.map((att) => {
                        const isVideo =
                          att.url.endsWith(".mp4") ||
                          att.url.endsWith(".webm") ||
                          att.url.endsWith(".ogg");
                        const isAudio =
                          att.url.endsWith(".mp3") || att.url.endsWith(".wav");
                        const isPDF = att.url.endsWith(".pdf");
                        const isCodeFile =
                          att.url.endsWith(".js") ||
                          att.url.endsWith(".html") ||
                          att.url.endsWith(".css");

                        return (
                          <div
                            key={att.public_id}
                            className="relative rounded-lg shadow-md"
                          >
                            {isVideo ? (
                              <video
                                className="w-full rounded-lg transition-transform duration-200 ease-in-out transform hover:scale-105"
                                controls
                              >
                                <source src={att.url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            ) : isAudio ? (
                              <audio controls className="w-full">
                                <source src={att.url} type="audio/mp3" />
                                Your browser does not support the audio tag.
                              </audio>
                            ) : isPDF ? (
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center border border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-200 ease-in-out"
                              >
                                <FaFilePdf className="mr-2" />
                                Download PDF
                              </a>
                            ) : isCodeFile ? (
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block border border-gray-600 p-2 rounded-lg hover:border-gray-400"
                              >
                                Download{" "}
                                {att.url.split(".").pop().toUpperCase()} file
                              </a>
                            ) : (
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block overflow-hidden rounded-lg border border-gray-600 hover:border-gray-400 transition duration-200 ease-in-out"
                              >
                                <img
                                  src={att.url}
                                  className="h-20 sm:h-32 w-40 object-cover rounded-lg transition-transform duration-200 ease-in-out transform hover:scale-105"
                                  alt="Image attachment"
                                />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <p
                  className={`top-2 ${
                    isSameSender ? "hidden" : "block"
                  } text-xs text-blue-500 cursor-pointer flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out px-2 py-1 rounded-lg z-10`}
                  onClick={() => handleReplyMessage(message)}
                >
                  <FaReply className="text-sm" /> Reply
                </p>
              </div>
            </div>
          );
        })}
      <div ref={bottomRef} />
    </div>
  );
};

export default ShowMessages;
