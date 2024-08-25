import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { getSocket } from "../../Socket";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "../../constants/event";
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

  const containerRef = useRef(null);
  const dispatch = useDispatch();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);

  const socket = getSocket();

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
    const newMessagesHandler = (data) => {
      if (data.message.chatId !== chatId) return;
      setMessages((prev) => [...prev, data?.message]);
    };

    const newMessageAlertHandler = (data) => {
      if (data.chatId === chatId) return;
      dispatch(setMessageNotification(data));
    };

    socket.on(NEW_MESSAGE, newMessagesHandler);
    socket.on(NEW_MESSAGE_ALERT, newMessageAlertHandler);

    return () => {
      socket.off(NEW_MESSAGE, newMessagesHandler);
      socket.off(NEW_MESSAGE_ALERT, newMessageAlertHandler);
    };
  }, [chatId, dispatch]);

  return (
    <>
      <div className="overflow-y-auto bg-gray-300  h-[91vh]" ref={containerRef}>
        <div>
          {allMessages.length > 0 &&
            allMessages.map((message) => {
              const isSameSender = message.sender._id === userId;
              return (
                <div key={message._id}>
                  {isSameSender ? (
                    <div className="flex items-center justify-end p-1">
                      <div className="bg-blue-500 text-white p-2 rounded-lg">
                        <h3>{message.content}</h3>
                        <div className="flex">
                          {message.attachment?.length > 0 &&
                            message.attachment?.map((att) => (
                              <div key={att.public_id}>
                                <div>
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <img
                                      src={att?.url}
                                      className="h-[200px] w-[200px] object-cover rounded-lg"
                                    />
                                  </a>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-start p-1">
                      <div className="bg-gray-300 text-black p-2 rounded-lg">
                        <h3>{message.sender.name}</h3>
                        <h3>{message.content}</h3>
                        <div className="flex">
                          {message.attachment?.length > 0 &&
                            message.attachment?.map((att) => (
                              <div key={att.public_id}>
                                <div>
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <img
                                      src={att?.url}
                                      className="h-[100px] w-[100px]"
                                    />
                                  </a>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      <div className="flex items-center justify-center w-full p-4 bg-gray-100">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <form onSubmit={submitHandler}>
              <div className="flex">
                <div className="">
                  <label htmlFor="file">
                    <span className="cursor-pointer">Select Files</span>
                    <input
                      type="file"
                      name="file"
                      id="file"
                      multiple
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    spellCheck={false}
                    placeholder="Type your message..."
                    value={message}
                    className="border border-black px-2 py-1"
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <button
                  className="px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:from-green-500 hover:to-blue-600 transition duration-200 ease-in-out"
                  type="submit"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Message;
