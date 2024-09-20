import { useState, useEffect, useRef } from "react";

export const useWebRTC = (socket, chatId, members, isVideoCall) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isRinging, setIsRinging] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  // const [isVideoCall, setIsVideoCall] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState(null); // Store the incoming offer
  const peerConnectionRef = useRef(null);
  const iceCandidatesQueue = useRef([]);

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
        video: isVideoCall
      });

      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      setLocalStream(stream);
    }
  };

  const handleAnswerCall = async () => {
    if (incomingOffer) {
      setIsRinging(false);
      await initializePeerConnection(); // Ensure peer connection is initialized before answering
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(incomingOffer)
        );
        const answerDescription =
          await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answerDescription);

        socket.emit("ANSWER_CALL", {
          answer: answerDescription,
          to: members,
          chatId
        });
      } catch (error) {
        console.error("Error answering call:", error);
      }
    }
  };

  const startCall = async (offer = null, isAnswering = false) => {
    await initializePeerConnection();

    if (!isAnswering) {
      const offerDescription = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offerDescription);

      socket.emit("CALL_USER", {
        offer: offerDescription,
        to: members,
        chatId,
        callType: isVideoCall ? "video" : "audio"
      });
    } else {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answerDescription = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answerDescription);

      socket.emit("ANSWER_CALL", {
        answer: answerDescription,
        to: members,
        chatId
      });
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
    socket.on("INCOMING_CALL", async (data) => {
      setIsRinging(true);
      setIncomingOffer(data.offer); // Store the incoming offer
      console.log(`Incoming ${data.callType} call from: ${data.fromName}`);
    });

    socket.on("CALL_USER", async (data) => {
      setIsRinging(false);
      setIsInCall(true);
      await handleAnswerCall(data.offer);
    });

    socket.on("CALL_ANSWERED", async (answer) => {
      setIsInCall(true);
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      await flushIceCandidates();
    });

    socket.on("ICE_CANDIDATE", async (data) => {
      const { candidate } = data;
      if (peerConnectionRef.current && candidate) {
        if (peerConnectionRef.current.remoteDescription) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } else {
          iceCandidatesQueue.current.push(candidate);
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

  const flushIceCandidates = async () => {
    if (
      peerConnectionRef.current.remoteDescription &&
      iceCandidatesQueue.current.length > 0
    ) {
      for (const candidate of iceCandidatesQueue.current) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      }
      iceCandidatesQueue.current = [];
    }
  };

  const handleEndCall = () => {
    endCall();
    setIsRinging(false);
  };

  return {
    localStream,
    remoteStream,
    startCall,
    endCall,
    isRinging,
    isInCall,
    isVideoCall,
    handleAnswerCall,
    handleEndCall
  };
};
