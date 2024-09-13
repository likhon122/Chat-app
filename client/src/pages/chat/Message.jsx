import { useInfiniteScrollTop } from "6pp";
import EmojiPicker from "emoji-picker-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { FaFilePdf, FaPaperPlane, FaTimes, FaUpload } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../../Socket";
import {
  useGetMessagesQuery,
  useMakeNotificationMutation,
  useSendAttachmentsMutation
} from "../../app/api/api";
import {
  resetMessageNotification,
  setMessageNotification
} from "../../app/features/chatSlice";
import {
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  START_TYPING,
  STOP_TYPING
} from "../../constants/event";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import useClickOutside from "../../hooks/useClickOutsideHook";
import { useSocketHook } from "../../hooks/useSocketHook";
import { setChatId } from "../../app/features/otherSlice";

const Message = ({ chatId }) => {
  const members = useSelector((state) => state.other.members);
  const userId = useSelector((state) => state.auth.user?._id);
  const { messageNotification } = useSelector((state) => state.chat);

  const socket = getSocket();
  const dispatch = useDispatch();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState([]);
  const [iAmTyping, setIAmTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [submitFile, setSubmitFile] = useState();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const typingTimeOut = useRef(null);
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const emojiRef = useRef(null);
  const messageInputRef = useRef(null);

  const oldMessagesChunk = useGetMessagesQuery({ chatId, page });

  const [sendAttachmentHandler, isLoading, setAttachmentData] =
    useAsyncMutation(useSendAttachmentsMutation);

  const totalPage = oldMessagesChunk.data?.payload?.pagination?.totalPages;

  const reversedFetchedMessages = useMemo(() => {
    return [...(oldMessagesChunk.data?.payload?.messages || [])].reverse();
  }, [oldMessagesChunk.data]);

  const { data, setData } = useInfiniteScrollTop(
    containerRef,
    totalPage,
    page,
    setPage,
    reversedFetchedMessages
  );

  const allMessages = [...data, ...messages];

  useClickOutside(emojiRef, () => {
    if (showEmojiPicker) {
      setShowEmojiPicker(false);
    }
  });

  const handleMessageChange = (e) => {
    setMessage(e.target.value);

    if (!iAmTyping) {
      socket.emit(START_TYPING, { members, chatId });
      setIAmTyping(true);
    }

    if (typingTimeOut.current) clearTimeout(typingTimeOut.current);

    typingTimeOut.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { members, chatId });
      setIAmTyping(false);
    }, 2000);
  };
  const handleEmojiClick = useCallback((emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
  }, []);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSubmitFile(files);
    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file)
    }));
    setSelectedImage((prevImages) => [...prevImages, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImage((prevImages) => prevImages.filter((_, i) => i !== index));
    setSubmitFile((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const getGridClasses = (length) => {
    if (length > 4) return "grid-cols-3";
    if (length > 2) return "grid-cols-3";
    return "grid-cols-2";
  };

  const getItemClasses = () => "w-16 h-16";

  const submitHandler = async (e) => {
    messageInputRef.current?.focus();
    e.preventDefault();
    // document.getElementById("messageInput").focus();

    const fileInput = e.target.file;
    const files = submitFile;

    if (message.trim() === "" && !files?.length) return;

    if (message && !files?.length) {
      socket.emit(NEW_MESSAGE, { chatId, members, message });
      setMessage("");

      return;
    }

    if (files?.length === 0 || files?.length > 5) return;

    const formData = new FormData();
    formData.append("chatId", chatId);

    for (let i = 0; i < files.length; i++) {
      formData.append("attachments", files[i]);
    }
    if (message) formData.append("message", message);

    try {
      fileInput.value = "";
      setMessage("");
      setSelectedImage([]);
      setSubmitFile([]);
      await sendAttachmentHandler("Sending attachments", formData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    dispatch(resetMessageNotification(chatId));
    return () => {
      setMessage("");
      setMessages([]);
      setPage(1);
      setData([]);
    };
  }, [chatId]);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    messageInputRef?.current?.focus(); // Focus the input box
    const handleBlur = () => {
      // Refocus the input when it loses focus
      messageInputRef?.current?.focus();
    };

    // Add event listener for blur
    messageInputRef.current.addEventListener("blur", handleBlur);
  }, [chatId]);

  useEffect(() => {
    dispatch(setChatId(chatId));
  }, [chatId, dispatch]);

  const newMessagesHandler = useCallback(
    (data) => {
      if (data.message.chatId !== chatId) return;
      setMessages((prev) => [...prev, data?.message]);
    },
    [chatId, setMessages]
  );

  const newMessageAlertHandler = useCallback(
    (data) => {
      if (data.chatId === chatId) return;

      dispatch(setMessageNotification(data));
    },
    [chatId, dispatch]
  );

  const startTypingHandler = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(true);
    },
    [chatId]
  );

  const stopTypingHandler = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(false);
    },
    [chatId]
  );

  const eventHandlers = {
    [NEW_MESSAGE]: newMessagesHandler,
    [NEW_MESSAGE_ALERT]: newMessageAlertHandler,
    [START_TYPING]: startTypingHandler,
    [STOP_TYPING]: stopTypingHandler
  };

  useSocketHook(socket, eventHandlers);

  return (
    <div
      className={`flex flex-col h-[calc(100vh-90px)] sm:h-[calc(100vh-90px)] bg-gray-900 text-gray-100 scrollbar-thin scrollbar-thumb-rounded-lg`}
    >
      <div
        className="flex-1 overflow-y-auto bg-gray-800 p-4 rounded-t-lg shadow-lg"
        ref={containerRef}
      >
        {allMessages.length > 0 &&
          allMessages.map((message) => {
            const isSameSender = message.sender._id === userId;
            return (
              <div
                key={message._id}
                className={`flex ${
                  isSameSender ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <div
                  className={`p-4 shadow-md max-w-full sm:max-w-md lg:max-w-lg min-w-20 ${
                    isSameSender
                      ? "bg-[#0B2F9F] text-white rounded-s-[1.6rem]  rounded-tr-[1.6rem]"
                      : "bg-gray-700 text-gray-200 rounded-e-[1.6rem] rounded-bl-[1.6rem]"
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
                      className={`mt-2 grid ${
                        message.attachment?.length < 2
                          ? "grid-cols-1"
                          : "sm:grid-cols-2"
                      } grid-cols-1 gap-2`}
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
                            className="relative overflow-hidden rounded-lg shadow-md"
                          >
                            {isVideo ? (
                              <video
                                className="w-[200px] h-auto object-cover transition-transform duration-200 ease-in-out transform hover:scale-105"
                                controls
                                src={att.url}
                              />
                            ) : isAudio ? (
                              <audio controls className="w-full">
                                <source src={att.url} />
                              </audio>
                            ) : isPDF ? (
                              <div className="relative">
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center border border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-200 ease-in-out"
                                >
                                  <FaFilePdf className="mr-2" />
                                  Download PDF
                                </a>
                              </div>
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
                                  className="h-20  sm:h-32 w-40 object-cover rounded-lg transition-transform duration-200 ease-in-out transform hover:scale-105"
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
              </div>
            );
          })}
        <div ref={bottomRef} />
      </div>

      {userTyping && (
        <div className="bg-gray-800 p-2 text-center text-sm text-gray-400 flex justify-center items-center shadow-md rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-4"
            viewBox="0 0 100 20"
            fill="none"
            stroke="none"
          >
            <circle cx="10" cy="10" r="8" fill="currentColor" className="dot" />
            <circle cx="30" cy="10" r="8" fill="currentColor" className="dot" />
            <circle cx="50" cy="10" r="8" fill="currentColor" className="dot" />
            <circle cx="70" cy="10" r="8" fill="currentColor" className="dot" />
            <circle cx="90" cy="10" r="8" fill="currentColor" className="dot" />
            <style>
              {`
          .dot {
            animation: bounce 1.5s infinite;
          }
          .dot:nth-child(1) { animation-delay: 0s; }
          .dot:nth-child(2) { animation-delay: 0.3s; }
          .dot:nth-child(3) { animation-delay: 0.6s; }
          .dot:nth-child(4) { animation-delay: 0.9s; }
          .dot:nth-child(5) { animation-delay: 1.2s; }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: scale(1);
            }
            40% {
              transform: scale(1.2);
            }
            60% {
              transform: scale(1.2);
            }
          }
        `}
            </style>
          </svg>
        </div>
      )}

      <div className="relative bg-gray-800 p-3 sm:p-4 border-t border-gray-600">
        <div>
          {selectedImage.length > 0 && (
            <div
              className={`absolute left-4 md:left-28 bottom-[75px] bg-[#374151] p-2 md:p-3 rounded-xl max-h-80 max-w-80 grid gap-2 ${getGridClasses(
                selectedImage.length
              )}`}
            >
              {selectedImage.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.url}
                    alt={`Selected ${index}`}
                    className={`object-cover rounded-lg border border-gray-600 ${getItemClasses()}`}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    className="absolute top-0 right-0 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <form
          onSubmit={submitHandler}
          className="flex flex-row items-center space-x-2 sm:space-y-0 sm:space-x-4"
        >
          <label
            htmlFor="file"
            className=" relative text-blue-400 hover:text-blue-300 transition-colors duration-200 ease-in-out flex items-center cursor-pointer"
          >
            <FaUpload className="mr-2" />
            <span className="text-xs hidden sm:block cursor-pointer">
              Select Files
            </span>
            <input
              type="file"
              name="file"
              id="file"
              multiple
              className="opacity-0 absolute z-30 left-0 sm:w-[80px] w-6 cursor-pointer"
              onChange={handleFileChange}
            />
          </label>
          <div className="relative flex-1 w-full">
            <input
              type="text"
              id="messageInput"
              spellCheck={false}
              placeholder="Type your message..."
              value={message}
              className="border border-gray-600 bg-gray-700 px-2 py-1 sm:p-2 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all w-full"
              onChange={handleMessageChange}
              ref={messageInputRef}
            />

            <button
              className=" bg-[#1230AE] text-[18px]   font-semibold px-[9px] py-[7px] sm:py-[9px]  transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95  absolute right-0 top-[0px] border border-[#1230AE] rounded-e-lg"
              type="submit"
            >
              <FaPaperPlane className="text-[18px] sm:text-[22px] text-white" />
            </button>
          </div>
          <div className="relative hidden md:flex items-center " ref={emojiRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 transition duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle emoji picker" // Accessibility
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50 ">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    height={400}
                    width={300}
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Message;
