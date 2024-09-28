import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getSocket } from "./SocketHelper"; // Socket connection logic

import { setIncomingOffer, setMembers } from "./app/features/otherSlice";
import { useDispatch } from "react-redux";

const GlobalCallHandler = () => {
  const navigate = useNavigate();
  const socket = getSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on(
      "INCOMING_CALL",
      ({ chatId, callType, members, fromName, offer, from }) => {
        console.log(members);
        dispatch(setMembers(members));
        dispatch(setIncomingOffer(offer));
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

  return null;
};

export default GlobalCallHandler;
