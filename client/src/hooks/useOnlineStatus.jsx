import { useEffect, useState } from "react";
import { useGetSocket } from "../SocketHelper";
import { useGetOnlineUsersQuery } from "../app/api/api";
import {
  USER_ONLINE,
  USER_OFFLINE,
  ONLINE_USERS_LIST
} from "../constants/event";

export const useOnlineStatus = () => {
  const socket = useGetSocket();
  const { data: onlineUserData } = useGetOnlineUsersQuery(undefined, {
    pollingInterval: 15000
  });

  const [onlineIds, setOnlineIds] = useState(new Set());

  // Initialize from API query
  useEffect(() => {
    if (onlineUserData?.payload?.onlineFriendsWithDetails) {
      setOnlineIds(
        new Set(
          onlineUserData.payload.onlineFriendsWithDetails.map((u) =>
            u._id?.toString()
          )
        )
      );
    }
  }, [onlineUserData]);

  // Real-time socket events
  useEffect(() => {
    if (!socket) return;

    const handleUserOnline = (payload) => {
      const uId = payload?.userId || payload;
      if (uId) {
        setOnlineIds((prev) => new Set([...prev, uId.toString()]));
      }
    };

    const handleUserOffline = (payload) => {
      const uId = payload?.userId;
      if (uId) {
        setOnlineIds((prev) => {
          const next = new Set(prev);
          next.delete(uId.toString());
          return next;
        });
      }
    };

    const handleOnlineList = (ids) => {
      if (Array.isArray(ids)) {
        setOnlineIds(new Set(ids.map((id) => id?.toString())));
      }
    };

    socket.on(USER_ONLINE, handleUserOnline);
    socket.on(USER_OFFLINE, handleUserOffline);
    socket.on(ONLINE_USERS_LIST, handleOnlineList);

    socket.emit("GET_ONLINE_USERS");

    return () => {
      socket.off(USER_ONLINE, handleUserOnline);
      socket.off(USER_OFFLINE, handleUserOffline);
      socket.off(ONLINE_USERS_LIST, handleOnlineList);
    };
  }, [socket]);

  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineIds.has(userId.toString());
  };

  return { onlineIds, isUserOnline };
};

export default useOnlineStatus;
