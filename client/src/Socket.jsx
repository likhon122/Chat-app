import { io } from "socket.io-client";
import { serverUrl } from "..";
import { createContext, useContext, useMemo } from "react";

const SocketContext = createContext();

export const getSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
};

const SocketProvider = ({ children }) => {
  const socket = useMemo(() => io(serverUrl, { withCredentials: true }), []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketProvider };
