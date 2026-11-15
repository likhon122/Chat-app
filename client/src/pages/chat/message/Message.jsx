import { useInfiniteScrollTop } from "6pp";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaXmark, FaReply } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { useGetSocket } from "../../../SocketHelper";
import {
  useGetGroupDetailsQuery,
  useGetMessagesQuery,
  useSendAttachmentsMutation
} from "../../../app/api/api";
import {
  resetMessageNotification,
  setMessageNotification
} from "../../../app/features/chatSlice";
import { setChatId, setMembers } from "../../../app/features/otherSlice";
import {
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  START_TYPING,
  STOP_TYPING,
  USER_ONLINE,
  USER_OFFLINE,
  ONLINE_USERS_LIST,
  MESSAGES_SEEN,
  MESSAGES_DELIVERED
} from "../../../constants/event";
import { useAsyncMutation } from "../../../hooks/useAsyncMutationHook";
import useClickOutside from "../../../hooks/useClickOutsideHook";
import { useSocketHook } from "../../../hooks/useSocketHook";
import { toast } from "../../../utils/alert";
import MessageInputBox from "./MessageInputBox";
import ShowMessages from "./ShowMessages";
import TypingIndicator from "./TypingIndicator";
import SingleSpinner from "../../../components/Loaders/SingleSpinner";
import { useParams } from "react-router-dom";

const truncateReplyText = (text, maxLength = 75) => {
  if (!text || typeof text !== "string") return "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).trim() + "...";
};

const Message = ({ chatId }) => {
  const members = useSelector((state) => state.other.members);
  const userId = useSelector((state) => state.auth.user?._id);

  const socket = useGetSocket();
  const dispatch = useDispatch();
  const params = useParams();

  const activeChatId = chatId || params.chatId;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [attachments, setAttachments] = useState([]);
  const [iAmTyping, setIAmTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyMessage, setReplyMessage] = useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [messagePage, setMessagePage] = useState(0);
  const [realtimeOnlineIds, setRealtimeOnlineIds] = useState(new Set());

  const typingTimeOut = useRef(null);
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const emojiRef = useRef(null);
  const messageInputRef = useRef(null);
  const messageRefs = useRef([]);

  const getItemClasses = () => "w-16 h-16";

  const oldMessagesChunk = useGetMessagesQuery({ chatId: activeChatId, page });
  const { data: groupData } = useGetGroupDetailsQuery(activeChatId);

  const chat = groupData?.payload?.chat;
  const isGroupChat = chat?.groupChat;
  const friend = useMemo(() => {
    if (!chat || isGroupChat) return null;
    return chat.members?.find(
      (m) => (m._id || m).toString() !== userId?.toString()
    );
  }, [chat, isGroupChat, userId]);

  useEffect(() => {
    if (friend?.isOnline && friend?._id) {
      setRealtimeOnlineIds((prev) => new Set([...prev, friend._id.toString()]));
    }
  }, [friend]);

  const [sendAttachmentHandler, isLoading] = useAsyncMutation(
    useSendAttachmentsMutation
  );

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
    const files = Array.from(event.target.files || []);
    if (!files || files.length === 0) return;

    if (attachments.length >= 5) {
      toast.error("Maximum 5 attachments allowed per message.");
      return;
    }

    if (attachments.length + files.length > 5) {
      toast.warning(
        "You can only send up to 5 attachments at a time. Extra files were not added."
      );
    }

    const availableSlots = Math.max(0, 5 - attachments.length);
    const filesToAdd = files.slice(0, availableSlots);

    const newItems = filesToAdd.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      url: URL.createObjectURL(file)
    }));

    setAttachments((prev) => [...prev, ...newItems]);
  };

  const handleRemoveAttachment = (idOrIndex) => {
    setAttachments((prev) => {
      let target;
      let nextList;
      if (typeof idOrIndex === "number") {
        target = prev[idOrIndex];
        nextList = prev.filter((_, i) => i !== idOrIndex);
      } else {
        target = prev.find((item) => item.id === idOrIndex);
        nextList = prev.filter((item) => item.id !== idOrIndex);
      }
      if (target?.url) {
        try {
          URL.revokeObjectURL(target.url);
        } catch {
          // ignore
        }
      }
      return nextList;
    });
  };

  const handleClearAllAttachments = () => {
    attachments.forEach((item) => {
      if (item?.url) {
        try {
          URL.revokeObjectURL(item.url);
        } catch {
          // ignore
        }
      }
    });
    setAttachments([]);
  };

  useEffect(() => {
    return () => {
      attachments.forEach((item) => {
        if (item?.url) {
          try {
            URL.revokeObjectURL(item.url);
          } catch {
            // ignore
          }
        }
      });
    };
  }, [chatId]);

  const getGridClasses = (length) => {
    if (length > 4) return "grid-cols-3";
    if (length > 2) return "grid-cols-3";
    if (length === 2) return "grid-cols-2";
    return "grid-cols-1";
  };

  const handleReplyMessage = (msg) => {
    setReplyMessage(msg);
    messageInputRef.current?.focus();
  };

  const handleShowReplyMessage = (msg) => {
    if (msg.replyTo && (msg.replyTo._id || msg.replyTo.realTimeId)) {
      const repliedMessageId = msg.replyTo._id || msg.replyTo.realTimeId;
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
    e?.preventDefault?.();
    messageInputRef.current?.focus();

    const trimmed = message.trim();
    const hasText = trimmed.length > 0;
    const hasAttachments = attachments.length > 0;

    if (!hasText && !hasAttachments) return;

    if (hasAttachments && attachments.length > 5) {
      toast.error("Please provide at most 5 attachments.");
      return;
    }

    // Text-only with reply
    if (hasText && !hasAttachments && replyMessage) {
      socket.emit(NEW_MESSAGE, {
        chatId,
        members,
        message: trimmed,
        replyTo: replyMessage.realTimeId || replyMessage._id
      });
      setMessage("");
      setReplyMessage(null);
      return;
    }

    // Text-only without reply
    if (hasText && !hasAttachments) {
      socket.emit(NEW_MESSAGE, { chatId, members, message: trimmed });
      setMessage("");
      return;
    }

    // Sending attachments (with optional text/caption)
    const formData = new FormData();
    formData.append("chatId", chatId);

    for (let i = 0; i < attachments.length; i++) {
      formData.append("attachments", attachments[i].file);
    }
    if (hasText) {
      formData.append("message", trimmed);
    }

    try {
      const res = await sendAttachmentHandler(
        "Sending attachments...",
        formData
      );

      if (res?.success) {
        attachments.forEach((item) => {
          if (item?.url) {
            try {
              URL.revokeObjectURL(item.url);
            } catch {
              // ignore
            }
          }
        });
        setAttachments([]);
        setMessage("");
        if (replyMessage) setReplyMessage(null);
      }
    } catch (error) {
      console.error("Attachment send error:", error);
    }
  };

  useEffect(() => {
    if (groupData?.payload?.chat) {
      const groupMembers = [];
      groupData.payload.chat.members.forEach((m) => {
        groupMembers.push(m._id);
      });
      dispatch(setMembers(groupMembers));
    }
  }, [groupData, dispatch]);

  useEffect(() => {
    dispatch(resetMessageNotification(chatId));
    return () => {
      setMessage("");
      setMessages([]);
      setPage(1);
      setData([]);
      setMessagePage(0);
    };
  }, [chatId, dispatch, setData]);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    dispatch(setChatId(chatId));
  }, [chatId, dispatch]);

  useEffect(() => {
    if (!socket || !activeChatId) return;

    socket.emit("GET_ONLINE_USERS");

    const targetMembers =
      chat?.members?.map((m) => m._id || m) || members || [];
    socket.emit(MESSAGES_SEEN, {
      chatId: activeChatId,
      members: targetMembers
    });
  }, [socket, activeChatId, chat, members]);

  const newMessagesHandler = useCallback(
    (data) => {
      if (data.message.chatId !== activeChatId) return;
      setMessages((prev) => [...prev, data?.message]);

      if (data?.message?.sender?._id !== userId) {
        const targetMembers =
          chat?.members?.map((m) => m._id || m) || members || [];
        socket?.emit(MESSAGES_SEEN, {
          chatId: activeChatId,
          members: targetMembers
        });
      }
    },
    [activeChatId, userId, chat, members, socket]
  );

  const newMessageAlertHandler = useCallback(
    (data) => {
      if (data.chatId === activeChatId) return;
      dispatch(setMessageNotification(data));
    },
    [activeChatId, dispatch]
  );

  const startTypingHandler = useCallback(
    (data) => {
      if (data.chatId !== activeChatId) return;
      setUserTyping(true);
    },
    [activeChatId]
  );

  const stopTypingHandler = useCallback(
    (data) => {
      if (data.chatId !== activeChatId) return;
      setUserTyping(false);
    },
    [activeChatId]
  );

  const userOnlineHandler = useCallback((payload) => {
    const uId = payload?.userId || payload;
    if (uId) {
      setRealtimeOnlineIds((prev) => new Set([...prev, uId.toString()]));
    }
  }, []);

  const userOfflineHandler = useCallback((payload) => {
    const uId = payload?.userId;
    if (uId) {
      setRealtimeOnlineIds((prev) => {
        const next = new Set(prev);
        next.delete(uId.toString());
        return next;
      });
    }
  }, []);

  const onlineUsersListHandler = useCallback((ids) => {
    if (Array.isArray(ids)) {
      setRealtimeOnlineIds(new Set(ids.map((id) => id.toString())));
    }
  }, []);

  const messagesDeliveredHandler = useCallback(
    (data) => {
      const chatIds = data?.chatIds;
      if (chatIds && !chatIds.includes(activeChatId)) return;

      const updateDelivered = (list) =>
        list.map((m) => {
          if (m.sender?._id === userId && m.status === "sent") {
            return { ...m, status: "delivered" };
          }
          return m;
        });

      setData((prev) => (Array.isArray(prev) ? updateDelivered(prev) : []));
      setMessages((prev) => (Array.isArray(prev) ? updateDelivered(prev) : []));
    },
    [activeChatId, userId, setData]
  );

  const messagesSeenHandler = useCallback(
    (data) => {
      if (data.chatId !== activeChatId) return;
      const seenBy = data.seenBy;
      if (!seenBy || seenBy._id === userId) return;

      const updateSeen = (list) =>
        list.map((m) => {
          if (m.sender?._id === userId) {
            const alreadyRead = m.readBy?.some(
              (r) => (r._id || r).toString() === seenBy._id.toString()
            );
            const nextReadBy = alreadyRead
              ? m.readBy
              : [...(m.readBy || []), seenBy];
            return {
              ...m,
              status: "seen",
              readBy: nextReadBy
            };
          }
          return m;
        });

      setData((prev) => (Array.isArray(prev) ? updateSeen(prev) : []));
      setMessages((prev) => (Array.isArray(prev) ? updateSeen(prev) : []));
    },
    [activeChatId, userId, setData]
  );

  const eventHandlers = {
    [NEW_MESSAGE]: newMessagesHandler,
    [NEW_MESSAGE_ALERT]: newMessageAlertHandler,
    [START_TYPING]: startTypingHandler,
    [STOP_TYPING]: stopTypingHandler,
    [USER_ONLINE]: userOnlineHandler,
    [USER_OFFLINE]: userOfflineHandler,
    [ONLINE_USERS_LIST]: onlineUsersListHandler,
    [MESSAGES_DELIVERED]: messagesDeliveredHandler,
    [MESSAGES_SEEN]: messagesSeenHandler
  };

  useSocketHook(socket, eventHandlers);

  const handleDeleteMessage = useCallback(
    (msgToDelete) => {
      const targetId = msgToDelete?._id || msgToDelete?.realTimeId;
      if (!targetId) return;

      const matches = (m) =>
        (m._id && m._id === targetId) ||
        (m.realTimeId && m.realTimeId === targetId);

      setData((prev) =>
        Array.isArray(prev) ? prev.filter((m) => !matches(m)) : []
      );
      setMessages((prev) =>
        Array.isArray(prev) ? prev.filter((m) => !matches(m)) : []
      );
    },
    [setData]
  );

  useEffect(() => {
    if (oldMessagesChunk?.data?.payload) {
      setMessagePage(oldMessagesChunk.data.payload.pagination?.page);
    }
  }, [oldMessagesChunk.data]);

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-[#0c0d12] overflow-hidden">
      {/* Messages Scroll Area */}
      {oldMessagesChunk.isFetching && messagePage === 0 ? (
        <div className="flex justify-center items-center flex-1">
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
          messagePage={messagePage}
          isFetching={oldMessagesChunk.isFetching}
          onDeleteMessage={handleDeleteMessage}
          realtimeOnlineIds={realtimeOnlineIds}
          recipient={friend}
        />
      )}

      {/* Typing Indicator */}
      <TypingIndicator userTyping={userTyping} />

      {/* Reply Banner */}
      {replyMessage && (
        <div className="px-4 py-2 bg-white/90 dark:bg-[#161822] border-t border-b border-gray-200 dark:border-white/10 flex items-center justify-between gap-3 backdrop-blur-md overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 border-l-2 border-cyan-500 pl-3">
            <FaReply className="text-cyan-500 text-xs flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 truncate block">
                Replying to{" "}
                {userId === replyMessage.sender?._id
                  ? "Yourself"
                  : replyMessage.sender?.name}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full break-all">
                {truncateReplyText(replyMessage.content, 75) || "Media attachment"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setReplyMessage(null)}
            className="p-1.5 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition flex-shrink-0 cursor-pointer"
            title="Cancel reply"
          >
            <FaXmark className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Message Input Box */}
      <MessageInputBox
        attachments={attachments}
        selectedImage={attachments}
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
        handleRemoveAttachment={handleRemoveAttachment}
        handleRemoveImage={handleRemoveAttachment}
        handleClearAll={handleClearAllAttachments}
        handleMessageChange={handleMessageChange}
        isUploading={isLoading}
      />
    </div>
  );
};

export default Message;
