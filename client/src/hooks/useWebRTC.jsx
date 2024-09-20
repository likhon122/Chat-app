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
        video: false
      });

      console.log("Local stream tracks:", stream.getTracks());

      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      setLocalStream(stream);
    }
  };

  const startCall = async () => {
    if (isInCall) return; // Prevent starting a new call if already in one

    await initializePeerConnection();

    const offerDescription = await peerConnectionRef.current.createOffer();
    console.log(offerDescription);
    await peerConnectionRef.current.setLocalDescription(offerDescription);

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
      await initializePeerConnection();

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(incomingOffer)
      );

      // Add queued ICE candidates once remote description is set
      iceCandidatesQueue.current.forEach(async (candidate) => {
        try {
          await peerConnectionRef.current.addIceCandidate(candidate);
        } catch (error) {
          console.error("Error adding ICE candidate from queue", error);
        }
      });
      iceCandidatesQueue.current = []; // Clear the queue after adding candidates

      const answerDescription = await peerConnectionRef.current.createAnswer();
      console.log(answerDescription);
      await peerConnectionRef.current.setLocalDescription(answerDescription);

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

  useEffect(() => {
    socket.on("INCOMING_CALL", (data) => {
      setIsRinging(true);
      setIncomingOffer(data.offer);
    });

    socket.on("CALL_USER", async () => {
      setIsRinging(false);
      await handleAnswerCall();
    });

    socket.on("CALL_ANSWERED", async (answer) => {
      if (peerConnectionRef.current.signalingState !== "stable") {
        console.log(answer.answer);
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer.answer)
        );
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
  }, [socket]);

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
