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

  // console.log(localStream, remoteStream);

  const initializePeerConnection = async () => {
    if (!peerConnectionRef.current) {
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
        video: isVideoCall // Use video only if it's a video call
      });

      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      console.log(stream);

      setLocalStream(stream);
    }
  };

  const startCall = async () => {
    if (isInCall) return;

    // Initialize peer connection if it doesn't exist
    if (!peerConnectionRef.current) {
      await initializePeerConnection();
    }

    // Create an offer
    const offerDescription = await peerConnectionRef.current.createOffer();

    try {
      await peerConnectionRef.current.setLocalDescription(offerDescription);
    } catch (error) {
      console.error("Error setting local description", error);
      return; // Prevent further execution on error
    }

    const membersWithoutMe = members.filter((member) => member !== user?._id);

    socket.emit("CALL_USER", {
      offer: offerDescription,
      to: membersWithoutMe,
      chatId,
      callType: isVideoCall ? "video" : "audio",
      members
    });

    setIsInCall(true);
  };

  const handleAnswerCall = async () => {
    if (incomingOffer) {
      setIsRinging(false);

      if (!peerConnectionRef.current) {
        await initializePeerConnection();
      }

      // Set remote description first
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(incomingOffer)
      );

      // Then create the answer
      const answerDescription = await peerConnectionRef.current.createAnswer();

      // Set local description with the created answer
      await peerConnectionRef.current.setLocalDescription(answerDescription);

      console.log("Answering call", answerDescription);

      socket.emit("ANSWER_CALL", {
        answer: answerDescription,
        to: members,
        chatId
      });

      setIsInCall(true);
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

  // ... (rest of your code)

  useEffect(() => {
    socket.on("INCOMING_CALL", (data) => {
      setIncomingOffer(data.offer);
      console.log(incomingOffer);
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
  }, [socket, incomingOffer]); // Added incomingOffer as a dependency

  // ... (rest of your code)

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
