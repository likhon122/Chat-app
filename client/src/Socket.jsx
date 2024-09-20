// SocketProvider.js
import { io } from "socket.io-client";
import { serverUrl } from "..";
import { createContext, useMemo } from "react";

export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const socket = useMemo(() => io(serverUrl, { withCredentials: true }), []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider };
