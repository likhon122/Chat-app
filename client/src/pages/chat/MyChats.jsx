import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaUserFriends, FaSearch, FaTimes, FaPlus, FaUsers } from "react-icons/fa";
import { BsCircleFill } from "react-icons/bs";
import { HiArrowPath, HiChatBubbleLeftRight, HiSparkles } from "react-icons/hi2";
import { useGetSocket } from "../../SocketHelper";
import {
  useGetChatsQuery,
  useGetNotificationsQuery,
  useGetOnlineUsersQuery,
  useMakeNotificationMutation,
  useReadNotificationMutation
} from "../../app/api/api";
import { setMembers, setSelectedChat, setMakeGroupDrawer } from "../../app/features/otherSlice";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT, REFETCH_CHATS } from "../../constants/event";
import { useSocketHook } from "../../hooks/useSocketHook";

const MyChats = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useGetSocket();
  const params = useParams();
  const currentChatId = params.chatId;

  const userName = useSelector((state) => state.auth?.user?.name);
  const userId = useSelector((state) => state.auth?.user?._id);
  const isHasChatId = useSelector((state) => state.other.chatId);
  const selectedChat = useSelector((state) => state.other.selectedChat);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'direct' | 'groups'
  const [chats, setChats] = useState([]);
  const [realtimeOnlineIds, setRealtimeOnlineIds] = useState(new Set());

  const { data, isLoading, refetch } = useGetChatsQuery();
  const { data: onlineUserData } = useGetOnlineUsersQuery();
  const { data: getNotificationData } = useGetNotificationsQuery(userId);
  const [makeNotificationHandler] = useMakeNotificationMutation();
  const [readNotificationHandler] = useReadNotificationMutation();

  // Initialize and synchronize chats state sorted descending by latest message
  useEffect(() => {
    if (data?.payload?.allChats) {
      const sorted = [...data.payload.allChats].sort((a, b) => {
        const timeA = new Date(a.lastMessage?.time || a.updatedAt || 0).getTime();
        const timeB = new Date(b.lastMessage?.time || b.updatedAt || 0).getTime();
        return timeB - timeA;
      });
      setChats(sorted);
    }
  }, [data]);

  useEffect(() => {
    if (onlineUserData?.payload?.onlineFriendsWithDetails) {
      setRealtimeOnlineIds(
        new Set(
          onlineUserData.payload.onlineFriendsWithDetails.map((user) => user._id)
        )
      );
    }
  }, [onlineUserData]);

  useEffect(() => {
    if (!socket) return;

    const handleUserOnline = (payload) => {
      const uId = payload?.userId || payload;
      if (uId) {
        setRealtimeOnlineIds((prev) => new Set([...prev, uId]));
      }
    };

    const handleUserOffline = (payload) => {
      const uId = payload?.userId;
      if (uId) {
        setRealtimeOnlineIds((prev) => {
          const next = new Set(prev);
          next.delete(uId);
          return next;
        });
      }
    };

    const handleOnlineList = (ids) => {
      if (Array.isArray(ids)) {
        setRealtimeOnlineIds(new Set(ids));
      }
    };

    socket.on("USER_ONLINE", handleUserOnline);
    socket.on("USER_OFFLINE", handleUserOffline);
    socket.on("ONLINE_USERS_LIST", handleOnlineList);

    socket.emit("GET_ONLINE_USERS");

    return () => {
      socket.off("USER_ONLINE", handleUserOnline);
      socket.off("USER_OFFLINE", handleUserOffline);
      socket.off("ONLINE_USERS_LIST", handleOnlineList);
    };
  }, [socket]);

  const handleClick = (chat) => {
    dispatch(setMembers(chat.members));

    getNotificationData?.payload?.length &&
      getNotificationData.payload.forEach((notification) => {
        if (notification.chatId === chat._id && notification.count > 0) {
          readNotificationHandler({ userId, chatId: chat._id });
        }
      });
    dispatch(setSelectedChat(chat));
    navigate(`/chat/${chat._id}?group-chat=${chat.groupChat}`);
  };

  const getNotificationCount = (chatId) => {
    const notification = getNotificationData?.payload?.find(
      (n) => n.chatId === chatId
    );
    return notification?.count || 0;
  };

  const isOnline = (chat) => {
    if (chat.groupChat) {
      return chat.members.some((member) => realtimeOnlineIds.has(member));
    } else {
      const friendId = chat.members.find((member) => member !== userId);
      return realtimeOnlineIds.has(friendId);
    }
  };

  const refetchHandler = useCallback(() => {
    refetch();
  }, [refetch]);

  // When ANY message arrives (incoming or sent by user), float that chat to the top!
  const newMessagesHandler = useCallback(
    (eventData) => {
      const msg = eventData.message;
      const targetChatId = eventData.chatId || msg?.chatId;
      if (!targetChatId) return;

      const lastMsgTime = msg?.createdAt || new Date().toISOString();
      const lastMsgContent =
        msg?.content ||
        (msg?.attachment?.length ? "Sent an attachment" : "New message");

      setChats((prevChats) => {
        const existingIndex = prevChats.findIndex(
          (c) => c._id?.toString() === targetChatId.toString()
        );

        if (existingIndex === -1) {
          refetch();
          return prevChats;
        }

        const targetChat = prevChats[existingIndex];
        const updatedChat = {
          ...targetChat,
          lastMessage: {
            lastMessage: lastMsgContent,
            lastAttachment: msg?.attachment,
            time: lastMsgTime
          },
          updatedAt: lastMsgTime
        };

        // Remove chat from existing position and prepend to index 0 (top of the list)
        const remainingChats = prevChats.filter(
          (c) => c._id?.toString() !== targetChatId.toString()
        );
        return [updatedChat, ...remainingChats];
      });
    },
    [refetch]
  );

  const newMessageAlertHandler = useCallback(
    (alertData) => {
      if (isHasChatId === alertData.chatId) return;
      if (alertData.sender?.toString() !== userId?.toString()) {
        makeNotificationHandler({ userId, chatId: alertData.chatId });
      }
    },
    [isHasChatId, userId, makeNotificationHandler]
  );

  const eventHandlers = {
    [NEW_MESSAGE]: newMessagesHandler,
    [REFETCH_CHATS]: refetchHandler,
    [NEW_MESSAGE_ALERT]: newMessageAlertHandler
  };

  useSocketHook(socket, eventHandlers);

  // Filter chats by search query and type, maintaining top-to-bottom recency
  const filteredChats = useMemo(() => {
    if (!chats || chats.length === 0) return [];

    return chats.filter((chat) => {
      // Type filter
      if (activeFilter === "direct" && chat.groupChat) return false;
      if (activeFilter === "groups" && !chat.groupChat) return false;

      // Query filter
      if (!searchQuery.trim()) return true;

      const chatTitle = chat.groupChat
        ? chat.chatName
        : chat.chatName
            .split("-")
            .filter((name) => name !== userName)[0] || "";

      return chatTitle.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [chats, searchQuery, userName, activeFilter]);

  return (
    <div className="h-full bg-white dark:bg-[#12131a] rounded-2xl overflow-hidden border border-gray-200/80 dark:border-white/10 shadow-xl flex flex-col">
      {/* Top Header */}
      <div className="p-4 border-b border-gray-100 dark:border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Messages
            </h2>
            {data?.payload?.allChats?.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                {data.payload.allChats.length}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => dispatch(setMakeGroupDrawer(true))}
            className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 transition active:scale-95 cursor-pointer shadow-sm"
            title="Create New Group"
            aria-label="Create New Group"
          >
            <FaPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-9 pr-8 rounded-2xl bg-gray-100/80 dark:bg-[#161822] border border-gray-200/80 dark:border-white/10 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/80 focus:bg-white dark:focus:bg-[#12131a] transition-all shadow-sm"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 pt-1">
          {[
            { key: "all", label: "All Chats" },
            { key: "direct", label: "Direct" },
            { key: "groups", label: "Groups" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition ${
                activeFilter === tab.key
                  ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-100 dark:divide-white/5">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex items-center space-x-3 p-2.5 animate-pulse rounded-2xl bg-gray-50 dark:bg-white/5"
              >
                <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-white/10" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 dark:bg-white/10 rounded w-2/3" />
                  <div className="h-2.5 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3">
              <HiChatBubbleLeftRight className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {searchQuery ? "No matches found" : "No conversations yet"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
              {searchQuery
                ? "Try searching with a different term"
                : "Add friends or start a group to begin chatting!"}
            </p>
          </div>
        ) : (
          <div className="py-1">
            {filteredChats.map((chat) => {
              const notificationCount = getNotificationCount(chat._id);
              const isSelectedChat =
                chat._id === selectedChat?._id || chat._id === currentChatId;
              const isChatOnline = isOnline(chat);

              const chatName = chat.groupChat
                ? chat.chatName
                : chat.chatName
                    .split("-")
                    .filter((name) => name !== userName)[0] || "Chat";

              return (
                <div
                  key={chat._id}
                  onClick={() => handleClick(chat)}
                  className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-all ${
                    isSelectedChat
                      ? "bg-cyan-500/10 dark:bg-cyan-500/15 border-l-4 border-cyan-400"
                      : "hover:bg-gray-50 dark:hover:bg-white/5 border-l-4 border-transparent"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {chat.groupChat ? (
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#16222A] to-[#26a0da] p-0.5 flex items-center justify-center">
                        <div className="w-full h-full bg-[#12131a] rounded-[14px] flex items-center justify-center text-cyan-400 font-bold text-xs">
                          <FaUsers className="w-5 h-5" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-[#161822]">
                        <img
                          src={chat.avatar || "https://via.placeholder.com/150"}
                          alt={chatName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Online / Offline Dot */}
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#12131a] flex items-center justify-center transition-colors ${
                        isChatOnline
                          ? "bg-emerald-500 shadow-[0_0_6px_#10b981]"
                          : "bg-gray-400 dark:bg-gray-500"
                      }`}
                      title={isChatOnline ? "Online" : "Offline"}
                    >
                      {isChatOnline && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isSelectedChat
                            ? "text-cyan-600 dark:text-cyan-400"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {chatName}
                      </h4>
                      {chat.lastMessage?.time && (
                        <span className="text-[10px] text-gray-400 ml-2 whitespace-nowrap">
                          {new Date(chat.lastMessage.time).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {chat.lastMessage?.lastMessage
                          ? chat.lastMessage.lastMessage
                          : chat.lastMessage?.lastAttachment?.length
                          ? "📎 Attachment"
                          : "No messages yet"}
                      </p>

                      {notificationCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-white flex-shrink-0 animate-pulse">
                          {notificationCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="p-3 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {Array.from(realtimeOnlineIds).filter((id) => id !== userId).length} friends active
          </span>
        </div>

        <button
          onClick={refetch}
          className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
        >
          <HiArrowPath className="w-3.5 h-3.5" />
          <span>Sync</span>
        </button>
      </div>
    </div>
  );
};

export default MyChats;
