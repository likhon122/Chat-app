import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "../../utils/alert";
import {
  FaInfoCircle,
  FaTimes,
  FaUsers,
  FaArrowLeft,
} from "react-icons/fa";
import { setGroupInfoDrawer } from "../../app/features/otherSlice";
import {
  useGetGroupDetailsQuery,
  useGetOnlineUsersQuery,
} from "../../app/api/api";
import { useGetSocket } from "../../SocketHelper";
import CallButtons from "./message/CallButtons";

// Helper function to format last seen date/time with elapsed duration
export const formatLastSeen = (lastSeenDate) => {
  if (!lastSeenDate) return "Offline";

  const date = new Date(lastSeenDate);
  if (isNaN(date.getTime())) return "Offline";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Negative diff or less than 40 seconds
  if (diffMs < 40 * 1000) {
    return "Offline • Just now";
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  // Time string (e.g. "10:45 AM")
  const timeStr = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Check if today
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    if (diffMinutes < 60) {
      return `Offline • ${diffMinutes}m ago (${timeStr})`;
    }
    return `Offline • ${diffHours}h ago (Today at ${timeStr})`;
  }

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Offline • Yesterday at ${timeStr} (${diffHours}h ago)`;
  }

  // Older date (e.g. Nov 11 at 4:30 PM • 2d ago)
  const dateStr = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  if (diffDays < 7) {
    return `Offline • ${diffDays}d ago (${dateStr} at ${timeStr})`;
  }

  const yearStr =
    date.getFullYear() !== now.getFullYear()
      ? `, ${date.getFullYear()}`
      : "";

  return `Offline • Last seen ${dateStr}${yearStr} at ${timeStr} (${diffDays}d ago)`;
};

const GroupChatNav = ({ chatId }) => {
  const { groupInfoDrawer } = useSelector((state) => state.other);
  const user = useSelector((state) => state.auth.user);
  const socket = useGetSocket();

  const { data, isLoading, isError } = useGetGroupDetailsQuery(chatId);
  const { data: onlineUserData } = useGetOnlineUsersQuery(undefined, {
    pollingInterval: 15000,
  });

  const [realtimeOnlineIds, setRealtimeOnlineIds] = useState(new Set());
  const [friendLastSeen, setFriendLastSeen] = useState(null);
  const [, setTick] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isGroupChat = data?.payload?.chat?.groupChat;
  const chat = data?.payload?.chat;
  const friendMembers = chat?.members?.filter(
    (member) => member._id !== user?._id
  );
  const friend = friendMembers?.[0];

  // Initialize online user IDs from initial query
  useEffect(() => {
    if (onlineUserData?.payload?.onlineFriendsWithDetails) {
      setRealtimeOnlineIds(
        new Set(
          onlineUserData.payload.onlineFriendsWithDetails.map((u) => u._id)
        )
      );
    }
  }, [onlineUserData]);

  // Synchronize friend's initial lastSeen and online state from chat details
  useEffect(() => {
    if (friend) {
      if (friend.lastSeen) {
        setFriendLastSeen(friend.lastSeen);
      }
      if (friend.isOnline) {
        setRealtimeOnlineIds((prev) => new Set([...prev, friend._id]));
      }
    }
  }, [friend]);

  // Real-time socket event listeners for user online/offline transitions
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
      const lastSeen = payload?.lastSeen;
      if (uId) {
        setRealtimeOnlineIds((prev) => {
          const next = new Set(prev);
          next.delete(uId);
          return next;
        });

        if (friend?._id === uId && lastSeen) {
          setFriendLastSeen(lastSeen);
        }
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

    // Request active list on mount/reconnect
    socket.emit("GET_ONLINE_USERS");

    return () => {
      socket.off("USER_ONLINE", handleUserOnline);
      socket.off("USER_OFFLINE", handleUserOffline);
      socket.off("ONLINE_USERS_LIST", handleOnlineList);
    };
  }, [socket, friend?._id]);

  // Periodic tick every 30s to update elapsed relative time
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleInfoButton = () => {
    dispatch(setGroupInfoDrawer(!groupInfoDrawer));
  };

  const handleClick = () => {
    if (!isGroupChat && friend?._id) {
      navigate(`/profile/${friend._id}`);
    }
  };

  useEffect(() => {
    dispatch(setGroupInfoDrawer(false));
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      navigate("/chat");
      toast.error("Unable to load chat details.");
    }
  }, [isError, navigate]);

  const chatTitle = isGroupChat
    ? chat?.chatName
    : chat?.chatName
        ?.split("-")
        ?.filter((name) => name !== user?.name)[0] || "Chat";

  const isFriendOnline = Boolean(
    !isGroupChat && friend?._id && realtimeOnlineIds.has(friend._id)
  );

  const groupOnlineCount = useMemo(() => {
    if (!isGroupChat || !chat?.members) return 0;
    return chat.members.filter((m) => realtimeOnlineIds.has(m._id)).length;
  }, [isGroupChat, chat?.members, realtimeOnlineIds]);

  const activeLastSeen = friendLastSeen || friend?.lastSeen;

  return (
    <header className="h-16 px-4 bg-white/80 dark:bg-[#12131a]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 flex items-center justify-between z-10 select-none">
      {/* Left Side: Back button (mobile) + Contact info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile back button */}
        <button
          onClick={() => navigate("/chat")}
          className="md:hidden p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition flex-shrink-0 cursor-pointer"
          title="Back to Chats"
        >
          <FaArrowLeft className="w-4 h-4" />
        </button>

        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ) : (
          <div
            onClick={!isGroupChat ? handleClick : undefined}
            className={`flex items-center gap-3 min-w-0 ${
              !isGroupChat ? "cursor-pointer group" : ""
            }`}
          >
            {/* Avatar Stack */}
            <div className="relative flex-shrink-0">
              {isGroupChat ? (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#16222A] to-[#26a0da] p-0.5 flex items-center justify-center shadow-md">
                  <div className="w-full h-full bg-[#12131a] rounded-[14px] flex items-center justify-center text-cyan-400">
                    <FaUsers className="w-5 h-5" />
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm bg-gray-100 dark:bg-[#161822]">
                  <img
                    src={
                      friend?.avatar ||
                      "https://via.placeholder.com/150"
                    }
                    alt={chatTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Online / Offline status indicator dot on avatar */}
              {!isGroupChat && (
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#12131a] flex items-center justify-center transition-colors ${
                    isFriendOnline
                      ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                      : "bg-gray-400 dark:bg-gray-500"
                  }`}
                  title={isFriendOnline ? "Online" : "Offline"}
                >
                  {isFriendOnline && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </div>
              )}
            </div>

            {/* Title & Live Status Subtitle */}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-cyan-500 transition">
                {chatTitle}
              </h3>
              <p className="text-xs flex items-center gap-1.5 truncate">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                    isGroupChat
                      ? "bg-cyan-500 shadow-[0_0_6px_#06b6d4]"
                      : isFriendOnline
                      ? "bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"
                      : "bg-gray-400 dark:bg-gray-500"
                  }`}
                />
                <span
                  className={`truncate ${
                    isFriendOnline
                      ? "text-emerald-500 dark:text-emerald-400 font-semibold"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                  title={
                    !isGroupChat && !isFriendOnline && activeLastSeen
                      ? `Last seen: ${new Date(activeLastSeen).toLocaleString()}`
                      : undefined
                  }
                >
                  {isGroupChat
                    ? `${chat?.members?.length || 0} members${
                        groupOnlineCount > 0 ? ` • ${groupOnlineCount} online` : ""
                      }`
                    : isFriendOnline
                    ? "Online"
                    : formatLastSeen(activeLastSeen)}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Side: Calls & Info Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <CallButtons
          chatId={chatId}
          member={friendMembers}
          isGroup={Boolean(isGroupChat)}
          chatTitle={chatTitle}
        />

        <button
          onClick={handleInfoButton}
          className={`p-2 rounded-xl transition cursor-pointer ${
            groupInfoDrawer
              ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/30"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
          }`}
          title={groupInfoDrawer ? "Hide details" : "Chat information"}
        >
          {groupInfoDrawer ? (
            <FaTimes className="w-4 h-4" />
          ) : (
            <FaInfoCircle className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};

export default GroupChatNav;
