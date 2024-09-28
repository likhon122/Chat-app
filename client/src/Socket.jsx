// SocketProvider.js
import { io } from "socket.io-client";
import { serverUrl } from "..";
import { createContext, useMemo, useEffect,  } from "react";

export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const socket = useMemo(() => {
    const newSocket = io(serverUrl, { withCredentials: true });

    // Handle socket connection errors
    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    return newSocket;
  }, [serverUrl]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider };
