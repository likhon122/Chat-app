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
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import {
  resetMessageNotification,
  setMessageNotification
} from "../../app/features/chatSlice";

const Message = ({ chatId }) => {
  const members = useSelector((state) => state.other.members);
  const userId = useSelector((state) => state.auth.user?._id);
  const { messageNotification } = useSelector((state) => state.chat);
  const socket = getSocket();

  const dispatch = useDispatch();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);

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
    <div className="flex flex-col h-[90.9vh] bg-gray-900 text-gray-100 scrollbar-thin scrollbar-thumb-rounded">
      <div
        className="flex-1 overflow-y-auto bg-gray-800 p-4 rounded-t-lg shadow-lg"
        ref={containerRef}
      >
        <div>
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
                    className={`p-3 rounded-lg ${
                      isSameSender
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300"
                    } shadow-md max-w-xs md:max-w-md`}
                  >
                    {!isSameSender && (
                      <h3 className="mb-1 text-gray-400 text-xs">
                        {message.sender.name}
                      </h3>
                    )}
                    <p className="break-words font-semibold">
                      {message.content}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.attachment?.length > 0 &&
                        message.attachment.map((att) => (
                          <a
                            key={att.public_id}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={att.url}
                              className="h-24 w-24 object-cover rounded-lg border border-gray-600"
                              alt=""
                            />
                          </a>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        <div ref={bottomRef} />
      </div>

      {userTyping && (
        <div className="bg-gray-800 p-2 text-center text-sm text-gray-400">
          <p>TYPING...</p>
        </div>
      )}

      <div className="bg-gray-800 p-4 border-t border-gray-600">
        <form onSubmit={submitHandler} className="flex items-center space-x-4">
          <label
            htmlFor="file"
            className="cursor-pointer text-blue-400 hover:underline"
          >
            <span>Select Files</span>
            <input
              type="file"
              name="file"
              id="file"
              multiple
              className="hidden"
            />
          </label>

          <input
            type="text"
            spellCheck={false}
            placeholder="Type your message..."
            value={message}
            className="flex-1 border border-gray-600 bg-gray-700 p-2 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            onChange={handleMessageChange}
          />

          <button
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out"
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
