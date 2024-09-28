import { useInfiniteScrollTop } from "6pp";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { FaXmark } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../../../SocketHelper";
import {
  useGetMessagesQuery,
  useSendAttachmentsMutation
} from "../../../app/api/api";
import {
  resetMessageNotification,
  setMessageNotification
} from "../../../app/features/chatSlice";
import { setChatId } from "../../../app/features/otherSlice";
import {
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  START_TYPING,
  STOP_TYPING
} from "../../../constants/event";
import { useAsyncMutation } from "../../../hooks/useAsyncMutationHook";
import useClickOutside from "../../../hooks/useClickOutsideHook";
import { useSocketHook } from "../../../hooks/useSocketHook";
import MessageInputBox from "./MessageInputBox";
import ShowMessages from "./ShowMessages";
import TypingIndicator from "./TypingIndicator";
import SingleSpinner from "../../../components/Loaders/SingleSpinner";

const Message = ({ chatId }) => {
  const members = useSelector((state) => state.other.members);
  const userId = useSelector((state) => state.auth.user?._id);

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
  const [replyMessage, setReplyMessage] = useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);

  const typingTimeOut = useRef(null);
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const emojiRef = useRef(null);
  const messageInputRef = useRef(null);
  const messageRefs = useRef([]);

  const getItemClasses = () => "w-16 h-16";

  const oldMessagesChunk = useGetMessagesQuery({ chatId, page });
  // const {
  //   data: groupDetails,
  //   error: groupDetailsError,
  //   isLoading: groupDetailsIsLoading
  // } = useGetGroupDetailsQuery(chatId);

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

  // const handleEndCall = () => {
  //   endCall();
  //   setIsCallStarted(false);
  // };

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

  const handleReplyMessage = (message) => {
    setReplyMessage(message);
  };

  const handleShowReplyMessage = (message) => {
    if (
      message.replyTo &&
      (message.replyTo._id || message.replyTo.realTimeId)
    ) {
      const repliedMessageId =
        message.replyTo._id || message.replyTo.realTimeId;

      const repliedMessageElement = messageRefs.current[repliedMessageId];

      if (repliedMessageElement) {
        repliedMessageElement.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
      setHighlightedMessageId(repliedMessageId);
    }
  };

  const submitHandler = async (e) => {
    messageInputRef.current?.focus();
    e.preventDefault();

    const fileInput = e.target.file;
    const files = submitFile;

    if (message.trim() === "" && !files?.length) return;

    if (message && !files?.length && replyMessage) {
      socket.emit(NEW_MESSAGE, {
        chatId,
        members,
        message,
        replyTo: replyMessage.realTimeId
      });
      setMessage("");
      setReplyMessage(null);
      return;
    }

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
      return;
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

  // useEffect(() => {
  //   messageInputRef?.current?.focus();
  //   const handleBlur = () => {
  //     messageInputRef?.current?.focus();
  //   };
  //   messageInputRef.current.addEventListener("blur", handleBlur);
  // }, [chatId]);

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
    <>
      <div
        className={`flex flex-col h-[calc(100vh-90px)] sm:h-[calc(100vh-90px)] bg-gray-800 text-gray-100 scrollbar-thin scrollbar-thumb-rounded-lg`}
      >
        {oldMessagesChunk.isFetching ? (
          <div className="flex justify-center items-center h-full">
            <SingleSpinner size="h-8 w-8" />
          </div>
        ) : (
          <ShowMessages
            bottomRef={bottomRef}
            containerRef={containerRef}
            handleReplyMessage={handleReplyMessage}
            handleShowReplyMessage={handleShowReplyMessage}
            messageRefs={messageRefs}
            allMessages={allMessages}
            replyMessage={replyMessage?.realTimeId}
            userId={userId}
            highlightedMessageId={highlightedMessageId}
          />
        )}

        <TypingIndicator userTyping={userTyping} />

        {replyMessage && (
          <div className="shadow-md p-1 sm:p-2 flex items-start bg-gray-800 border border-gray-700">
            <div className="ml-1 sm:ml-3 flex-1">
              <h1 className=" text-xs sm:text-md font-medium text-gray-200 font-sans">
                Replying to{" "}
                {userId === replyMessage.sender._id
                  ? "Yourself"
                  : replyMessage.sender.name}
              </h1>
              <div className="p-1 rounded-md italic">
                {!replyMessage.attachment?.length && replyMessage.content ? (
                  <p className="text-gray-300">
                    {replyMessage.content.length > 20
                      ? replyMessage.content.slice(0, 20) + "..."
                      : replyMessage.content}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">Attachment</p>
                )}
              </div>
            </div>
            <div
              className="ml-3 cursor-pointer text-gray-400 hover:text-red-500 transition duration-200"
              onClick={() => setReplyMessage(null)}
            >
              <FaXmark className="h-5 w-5" />
            </div>
          </div>
        )}

        <MessageInputBox
          selectedImage={selectedImage}
          emojiRef={emojiRef}
          getItemClasses={getItemClasses}
          getGridClasses={getGridClasses}
          handleEmojiClick={handleEmojiClick}
          handleFileChange={handleFileChange}
          message={message}
          messageInputRef={messageInputRef}
          submitHandler={submitHandler}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          handleRemoveImage={handleRemoveImage}
          handleMessageChange={handleMessageChange}
        />
      </div>
    </>
  );
};

export default Message;
