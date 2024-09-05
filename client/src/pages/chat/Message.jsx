import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { getSocket } from "../../Socket";
import {
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  START_TYPING,
  STOP_TYPING
} from "../../constants/event";
import { useDispatch, useSelector } from "react-redux";
import { useSocketHook } from "../../hooks/useSocketHook";
import {
  useGetMessagesQuery,
  useSendAttachmentsMutation
} from "../../app/api/api";
import { useInfiniteScrollTop } from "6pp";
import { toast } from "react-toastify";
import { FaFilePdf } from "react-icons/fa";
import { FaUpload } from "react-icons/fa";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import {
  resetMessageNotification,
  setMessageNotification
} from "../../app/features/chatSlice";
import SingleSpinner from "../../components/Loaders/SingleSpinner";

const Message = ({ chatId }) => {
  const members = useSelector((state) => state.other.members);
  const userId = useSelector((state) => state.auth.user?._id);
  const { messageNotification } = useSelector((state) => state.chat);
  const socket = getSocket();

  const dispatch = useDispatch();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  const [iAmTyping, setIAmTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const typingTimeOut = useRef(null);

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); // Set the selected image URL
    } else {
      setSelectedImage(null); // Clear the selected image if no file is chosen
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const fileInput = e.target.file;
    const files = fileInput?.files;

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
      setMessage("");
      fileInput.value = "";
      setSelectedImage("");
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

  const newMessagesHandler = useCallback(
    (data) => {
      if (data.message.chatId !== chatId) return;
      setMessages((prev) => [...prev, data?.message]);
    },
    [chatId]
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
    <div className="flex flex-col h-[calc(100vh-90px)] sm:h-[calc(100vh-90px)] bg-gray-900 text-gray-100 scrollbar-thin scrollbar-thumb-rounded-lg">
      <div
        className="flex-1 overflow-y-auto bg-gray-800 p-4 rounded-t-lg shadow-lg"
        ref={containerRef}
      >
        {/* Render messages */}
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
                      ? "bg-[#0B2F9F] text-white rounded-s-3xl rounded-ee-3xl rounded-tr-sm"
                      : "bg-gray-700 text-gray-200 rounded-e-3xl rounded-ss-3xl rounded-bl-sm"
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
                                  className="h-24 sm:h-32 w-full object-cover rounded-lg transition-transform duration-200 ease-in-out transform hover:scale-105"
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
        <div className="bg-gray-800 p-2 text-center text-sm text-gray-400">
          <p>TYPING...</p>
        </div>
      )}

      <div className="bg-gray-800 p-3 sm:p-4 border-t border-gray-600">
        <form
          onSubmit={submitHandler}
          className="flex flex-row items-center  sm:space-y-0 sm:space-x-4"
        >
          <label
            htmlFor="file"
            className="cursor-pointer text-blue-400 hover:text-blue-300 transition-colors duration-200 ease-in-out flex items-center"
          >
            <FaUpload className="mr-2" />
            <span className="text-xs sm:text-sm hidden md:block">Select Files</span>
            <input
              type="file"
              name="file"
              id="file"
              multiple
              className="hidden"
              onChange={handleFileChange} 
            />
          </label>

          <div className="relative flex-1 w-full">
            <input
              type="text"
              spellCheck={false}
              placeholder="Type your message..."
              value={message}
              className="border border-gray-600 bg-gray-700 p-2 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all w-full"
              onChange={handleMessageChange}
            />
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Selected"
                className="absolute top-0 right-0 h-10 w-10 object-cover rounded-lg border border-gray-600"
              />
            )}
          </div>

          <button
            className="sm:px-4 sm:py-5 px-4 py-2 bg-blue-500 text-white sm:font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-150 ease-in-out  sm:w-auto"
            type="submit"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Message;
