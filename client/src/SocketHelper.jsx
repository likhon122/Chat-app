// socketHelper.js
import { useContext } from "react";
import { SocketContext } from "./Socket"; // Adjust the path if needed

export const useGetSocket = () => {
  const socket = useContext(SocketContext);
  // console.log(socket);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
};
