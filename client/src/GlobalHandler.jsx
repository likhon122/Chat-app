import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useGetSocket } from "./SocketHelper"; // Socket connection logic

import {
  setCallerDetails,
  setIncomingOffer,
  setMembers
} from "./app/features/otherSlice";
import { useDispatch } from "react-redux";

const GlobalCallHandler = () => {
  const navigate = useNavigate();
  const socket = useGetSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on(
      "INCOMING_CALL",
      ({ chatId, callType, members, fromName, offer, from, callerInfo }) => {
        console.log(members);
        dispatch(setMembers(members));
        dispatch(setIncomingOffer(offer));
        dispatch(setCallerDetails({ from, fromName, callerInfo }));
        navigate(
          `/call/${chatId}?type=${callType}&&from=${from}&&name=${fromName}&&offer=${JSON.stringify(
            offer
          )}`
        );
      }
    );

    return () => {
      socket.off("INCOMING_CALL");
    };
  }, [navigate, socket, dispatch]);

  // useEffect(() => {
  //   socket.on("CALL_REJECTED", () => {
  //     navigate("/chat");
  //   });
  //   return () => {
  //     socket.off("CALL_REJECTED");
  //   };
  // }, [socket, navigate]);

  return null;
};

export default GlobalCallHandler;
