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
    // Create peer connection
    if (!peerConnectionRef.current) {
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });

      // Set up event listeners
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

      // Get the local stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideoCall
      });

      // Add the tracks to the peer connection
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

      // Set remote description first
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(incomingOffer)
      );

      // Then create the answer
      const answerDescription = await peerConnectionRef.current.createAnswer();

      // Set local description with the created answer
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

    // Initialize peer connection if it doesn't exist
    await initializePeerConnection();

    // Create an offer
    if (!isInCall) {
      console.log(peerConnectionRef.current);
      const offerDescription = await peerConnectionRef.current.createOffer();
      console.log(peerConnectionRef.current);

      await peerConnectionRef.current.setLocalDescription(offerDescription);
      console.log(peerConnectionRef.current);

      socket.emit("CALL_USER", {
        offer: offerDescription,
        to: members,
        chatId,
        callType: isVideoCall ? "video" : "audio"
      });
    }
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
      console.log("Received answer:", answer);

      // Proceed only if the signaling state allows setting remote description
      if (peerConnectionRef.current.signalingState !== "stable") {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer.answer)
          );
        } catch (error) {
          console.error("Error setting remote description:", error);
        }
      }
    });

    socket.on("ICE_CANDIDATE", async (data) => {
      const { candidate } = data;

      if (peerConnectionRef.current) {
        // If remote description is not set, queue the ICE candidate
        if (peerConnectionRef.current.remoteDescription) {
          try {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } catch (error) {
            console.error("Error adding ICE candidate", error);
          }
        } else {
          // Queue ICE candidates if remote description is not yet available
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
