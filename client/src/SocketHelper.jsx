// socketHelper.js
import { useContext } from "react";
import { SocketContext } from "./Socket"; // Adjust the path if needed

export const getSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
};
