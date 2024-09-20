import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

export const useWebRTC = (socket, chatId, members, isVideoCall) => {
  const user = useSelector((state) => state.auth.user);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isRinging, setIsRinging] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const peerConnectionRef = useRef(null);
  const iceCandidatesQueue = useRef([]);

  const initializePeerConnection = async () => {
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: isVideoCall
    });
    setLocalStream(stream); // Set local stream to state
    stream.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, stream);
    });

    peerConnectionRef.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnectionRef.current.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit("ICE_CANDIDATE", { candidate, to: members, chatId });
      }
    };
  };

  const startCall = async () => {
    if (isInCall) return;

    if (!peerConnectionRef.current) {
      await initializePeerConnection();
    }

    const offerDescription = await peerConnectionRef.current.createOffer();

    try {
      await peerConnectionRef.current.setLocalDescription(offerDescription);
      socket.emit("CALL_USER", {
        offer: offerDescription,
        to: members.filter((member) => member !== user?._id),
        chatId,
        callType: isVideoCall ? "video" : "audio",
        members
      });
      setIsInCall(true);
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const handleAnswerCall = async () => {
    if (incomingOffer) {
      setIsRinging(false);
      if (!peerConnectionRef.current) {
        await initializePeerConnection();
      }

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

      // Process any queued ICE candidates after the remote description is set
      iceCandidatesQueue.current.forEach((candidate) => {
        peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      });
      iceCandidatesQueue.current = []; // Clear the queue after processing
    }
  };

  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsInCall(false);
    socket.emit("END_CALL", { to: members, chatId });
  };

  useEffect(() => {
    socket.on("INCOMING_CALL", (data) => {
      setIncomingOffer(data.offer);
      setIsRinging(true);
    });

    socket.on("CALL_USER", handleAnswerCall);

    socket.on("CALL_ANSWERED", async (answer) => {
      if (
        peerConnectionRef.current &&
        peerConnectionRef.current.signalingState !== "stable"
      ) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer.answer)
        );

        // Process any queued ICE candidates after setting remote description
        iceCandidatesQueue.current.forEach((candidate) => {
          peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        });
        iceCandidatesQueue.current = []; // Clear the queue after processing
      }
    });

    socket.on("ICE_CANDIDATE", async (data) => {
      const { candidate } = data;
      if (peerConnectionRef.current) {
        // Check if remote description is set before adding the candidate
        if (peerConnectionRef.current.remoteDescription) {
          try {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } catch (error) {
            console.error("Error adding ICE candidate", error);
          }
        } else {
          // Queue the candidate if the remote description is not set
          iceCandidatesQueue.current.push(candidate);
        }
      } else {
        // Queue the candidate if no connection exists
        iceCandidatesQueue.current.push(candidate);
      }
    });

    return () => {
      socket.off("INCOMING_CALL");
      socket.off("CALL_USER");
      socket.off("CALL_ANSWERED");
      socket.off("ICE_CANDIDATE");
    };
  }, [socket, incomingOffer]);

  return {
    localStream,
    remoteStream,
    startCall,
    handleAnswerCall,
    endCall,
    isRinging,
    isInCall
  };
};
