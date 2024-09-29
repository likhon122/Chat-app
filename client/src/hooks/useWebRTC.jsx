import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  callStarted,
  setCallerDetails,
  setIncomingOffer
} from "../app/features/otherSlice";

export const useWebRTC = (socket, chatId, members, isVideoCall) => {
  const user = useSelector((state) => state.auth.user);
  const { incomingOffer } = useSelector((state) => state.other);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isRinging, setIsRinging] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const peerConnectionRef = useRef(null);
  const iceCandidatesQueue = useRef([]);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const initializePeerConnection = async () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ICE_CANDIDATE", {
          candidate: event.candidate,
          to: members,
          chatId
        });
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: isVideoCall
    });

    if (!localStream) {
      setLocalStream(stream);
    }

    stream.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, stream);
    });
  };

  const handleAnswerCall = async () => {
    if (incomingOffer) {
      setIsRinging(false);
      await initializePeerConnection();

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(incomingOffer)
      );

      const answerDescription = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answerDescription);

      socket.emit("ANSWER_CALL", {
        answer: answerDescription,
        to: members,
        chatId
      });

      setIsInCall(true);
    }
  };

  const startCall = async () => {
    if (isInCall) return;

    await initializePeerConnection();

    const offerDescription = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offerDescription);

    setIsInCall(true);

    socket.emit("CALL_USER", {
      offer: offerDescription,
      to: members,
      chatId,
      callType: isVideoCall ? "video" : "audio",
      callerInfo: {
        from: user._id,
        fromName: user.name,
        avatar: user.avatar
      }
    });
  };

  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    dispatch(callStarted(false));
    dispatch(setIncomingOffer(null));
    dispatch(setCallerDetails(null));

    setIsInCall(false);
    setIsRinging(false);
    socket.emit("REJECT_CALL", { to: members, chatId });
  };

  useEffect(() => {
    if (incomingOffer) {
      setIsRinging(true);
    }
  }, [incomingOffer]);

  useEffect(() => {
    const handleCallRejected = () => {
      endCall();
      navigate("/chat");
    };

    socket.on("CALL_REJECTED", handleCallRejected);

    return () => {
      socket.off("CALL_REJECTED", handleCallRejected);
    };
  }, [socket, navigate]);

  useEffect(() => {
    socket.on("CALL_USER", async () => {
      setIsRinging(false);
      await handleAnswerCall();
    });

    socket.on("CALL_ANSWERED", async (answer) => {
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer.answer)
        );

        while (iceCandidatesQueue.current.length > 0) {
          const candidate = iceCandidatesQueue.current.shift();
          await peerConnectionRef.current.addIceCandidate(candidate);
        }
      } catch (error) {
        console.error("Error setting remote description:", error);
        toast.error("Failed to set remote description.");
      }
    });

    socket.on("ICE_CANDIDATE", async (data) => {
      const { candidate } = data;

      if (peerConnectionRef.current) {
        if (peerConnectionRef.current.remoteDescription) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } else {
          iceCandidatesQueue.current.push(new RTCIceCandidate(candidate));
        }
      }
    });

    socket.on("USER_OFFLINE", () => {
      setIsRinging(false);
      toast.error("User is offline", {
        autoClose: 700,
        closeButton: true
      });
      endCall();
    });

    return () => {
      socket.off("CALL_USER");
      socket.off("CALL_ANSWERED");
      socket.off("ICE_CANDIDATE");
      socket.off("USER_OFFLINE");
    };
  }, [socket, incomingOffer]);

  const memoizedLocalStream = useMemo(() => localStream, [localStream]);

  return {
    localStream: memoizedLocalStream,
    remoteStream,
    startCall,
    handleAnswerCall,
    endCall,
    isRinging,
    isInCall
  };
};
