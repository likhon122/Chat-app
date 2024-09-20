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
  const iceCandidatesQueue = useRef([]); // Queue for storing ICE candidates

  const initializePeerConnection = async () => {
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });

      // Send ICE candidates to the remote peer
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ICE_CANDIDATE", {
            candidate: event.candidate,
            to: members,
            chatId
          });
        }
      };

      // Handle remote stream tracks
      peerConnectionRef.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]); // Set the remote stream for rendering
      };

      // Get the local stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideoCall
      });

      // Add local tracks to the peer connection
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      setLocalStream(stream);
    }
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

    socket.emit("CALL_USER", {
      offer: offerDescription,
      to: members,
      chatId,
      callType: isVideoCall ? "video" : "audio"
    });

    setIsInCall(true);
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

    socket.on("CALL_USER", async () => {
      setIsRinging(false);
      await handleAnswerCall();
    });

    socket.on("CALL_ANSWERED", async (answer) => {
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer.answer)
        );

        // Process queued ICE candidates after remote description is set
        while (iceCandidatesQueue.current.length > 0) {
          const candidate = iceCandidatesQueue.current.shift();
          await peerConnectionRef.current.addIceCandidate(candidate);
        }
      } catch (error) {
        console.error("Error setting remote description:", error);
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
          // Queue the ICE candidate if remote description is not ready
          iceCandidatesQueue.current.push(new RTCIceCandidate(candidate));
        }
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
