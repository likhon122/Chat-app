import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getSocket } from "./SocketHelper"; // Socket connection logic

import { setMembers } from "./app/features/otherSlice";
import { useDispatch } from "react-redux";

const GlobalCallHandler = () => {
  const navigate = useNavigate();
  const socket = getSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on("INCOMING_CALL", ({ chatId, type, members }) => {
      console.log(members);
      dispatch(setMembers(members));
      navigate(`/call/${chatId}?type=${type}`);
    });

    return () => {
      socket.off("INCOMING_CALL");
    };
  }, [navigate, socket, dispatch]);

  return null;
};

export default GlobalCallHandler;
