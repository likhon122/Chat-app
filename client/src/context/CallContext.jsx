import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetSocket } from "../SocketHelper";
import { toast } from "../utils/alert";
import { callSounds } from "../utils/callSounds";
import {
  callStarted,
  setCallerDetails,
  setIncomingOffer,
  setMembers
} from "../app/features/otherSlice";

const CallContext = createContext(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};

export const CallProvider = ({ children }) => {
  const socket = useGetSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state) => state.auth.user);
  const { incomingOffer } = useSelector((state) => state.other);

  // Call Status State Machine: "idle" | "calling" | "incoming" | "connected" | "ended"
  const [callStatus, setCallStatus] = useState("idle");
  const [isCaller, setIsCaller] = useState(false);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callStartTime, setCallStartTime] = useState(null);

  // Active call session metadata
  const [activeCall, setActiveCall] = useState(null);

  const peerConnectionRef = useRef(null);
  const meshPeersRef = useRef(new Map());
  const iceCandidatesQueue = useRef([]);
  const remoteAudioRef = useRef(null);
  const ringTimeoutRef = useRef(null);

  // Automatically minimize if user navigates away from /call during an active call
  useEffect(() => {
    if (callStatus === "connected" || callStatus === "calling") {
      if (!location.pathname.startsWith("/call")) {
        setIsMinimized(true);
      } else {
        setIsMinimized(false);
      }
    }
  }, [location.pathname, callStatus]);

  // Ensure remote audio plays seamlessly across route transitions and mobile devices
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      // Ensure all remote audio tracks are active
      remoteStream.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });

      if (remoteAudioRef.current.srcObject !== remoteStream) {
        remoteAudioRef.current.srcObject = remoteStream;
      }

      remoteAudioRef.current.muted = false;
      remoteAudioRef.current.volume = 1.0;
      remoteAudioRef.current.play().catch((e) => {
        console.warn("Remote audio autoplay blocked by mobile policy, awaiting user touch:", e);
      });
    }
  }, [remoteStream]);

  // Mobile User Interaction Audio Unlocker
  // Mobile browsers restrict unmuted audio unless unlocked by a user gesture.
  // Any touch or click on the screen during a connected call unlocks and resumes playback.
  useEffect(() => {
    if (callStatus !== "connected") return;

    const unlockAudio = () => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.volume = 1.0;
        if (remoteAudioRef.current.paused) {
          remoteAudioRef.current.play().catch(() => {});
        }
      }
    };

    unlockAudio();

    window.addEventListener("touchstart", unlockAudio, { passive: true });
    window.addEventListener("touchend", unlockAudio, { passive: true });
    window.addEventListener("click", unlockAudio, { passive: true });

    return () => {
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("touchend", unlockAudio);
      window.removeEventListener("click", unlockAudio);
    };
  }, [callStatus, remoteStream]);

  // Clear 30-second ring timeout
  const clearRingTimeout = useCallback(() => {
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
  }, []);

  // Initialize WebRTC Peer Connection
  const initializePeerConnection = useCallback(
    async (members, chatId, isVideo) => {
      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.close();
        } catch (e) {
          console.warn("Error closing existing peer connection:", e);
        }
        peerConnectionRef.current = null;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
          { urls: "stun:stun.services.mozilla.com" }
        ]
      });

      peerConnectionRef.current = pc;

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("ICE_CANDIDATE", {
            candidate: event.candidate,
            to: members,
            chatId
          });
        }
      };

      pc.ontrack = (event) => {
        console.log("Remote WebRTC track received:", event.track?.kind);
        const stream =
          event.streams && event.streams[0]
            ? event.streams[0]
            : new MediaStream([event.track]);
        setRemoteStream(stream);

        const peerId =
          members?.find((m) => (m?._id || m)?.toString() !== user?._id?.toString()) ||
          "remote-peer";
        setRemoteStreams((prev) => ({
          ...prev,
          [peerId.toString()]: {
            stream,
            name: activeCall?.toName || activeCall?.fromName || "Friend",
            avatar: activeCall?.toImage || activeCall?.callerInfo?.avatar || ""
          }
        }));
      };

      pc.onconnectionstatechange = () => {
        console.log("WebRTC Peer Connection State:", pc.connectionState);
        if (pc.connectionState === "connected") {
          setCallStatus("connected");
        }
      };

      // Safe media stream acquirer with mobile fallbacks and legacy support
      const getMedia = async (constraints) => {
        if (navigator.mediaDevices?.getUserMedia) {
          return await navigator.mediaDevices.getUserMedia(constraints);
        }
        const legacyGUM =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia;
        if (legacyGUM) {
          return new Promise((res, rej) => legacyGUM.call(navigator, constraints, res, rej));
        }
        if (window.isSecureContext === false) {
          throw new Error("INSECURE_CONTEXT");
        }
        throw new Error("MEDIA_UNSUPPORTED");
      };

      const audioConfig = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      };

      try {
        let stream;
        if (isVideo) {
          try {
            // Try mobile user-facing camera first
            stream = await getMedia({
              audio: audioConfig,
              video: {
                facingMode: "user",
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            });
          } catch (camErr) {
            console.warn("Front camera constraint failed, trying basic video:", camErr);
            try {
              stream = await getMedia({
                audio: audioConfig,
                video: true
              });
            } catch (fallbackCamErr) {
              console.warn("Camera failed on mobile, falling back to audio only:", fallbackCamErr);
              toast.warning("Camera unavailable. Continuing with audio.");
              stream = await getMedia({
                audio: audioConfig,
                video: false
              });
            }
          }
        } else {
          stream = await getMedia({
            audio: audioConfig,
            video: false
          });
        }

        setLocalStream(stream);

        // Explicitly verify and enable audio tracks
        stream.getAudioTracks().forEach((track) => {
          track.enabled = true;
        });

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        return stream;
      } catch (err) {
        console.error("Failed to acquire user media on mobile:", err);
        if (err.message === "INSECURE_CONTEXT" || !window.isSecureContext) {
          toast.error("Camera and microphone require HTTPS on mobile. Please open via https://");
        } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          toast.error("Permission denied. Please allow microphone and camera in mobile browser settings.");
        } else {
          toast.error("Could not access camera or microphone on this device.");
        }
        throw err;
      }
    },
    [socket]
  );

  // End / terminate the call & record to DB
  const endCall = useCallback(
    (reason) => {
      clearRingTimeout();
      callSounds.stopCallSounds();

      const wasActive =
        callStatus === "connected" ||
        callStatus === "calling" ||
        callStatus === "incoming";

      let duration = 0;
      let status = "completed";

      if (callStatus === "connected" && callStartTime) {
        duration = Math.max(1, Math.floor((Date.now() - callStartTime) / 1000));
        status = "completed";
      } else {
        duration = 0;
        if (reason === "unanswered") {
          status = "unanswered";
        } else if (reason === "missed") {
          status = "missed";
        } else if (callStatus === "incoming") {
          status = "rejected";
        } else {
          status = "cancelled";
        }
      }

      // Record call to DB & real-time chat log
      if (wasActive && activeCall?.chatId && socket) {
        const callerId = (activeCall.from || activeCall.to)?.toString();
        const myId = user?._id ? user._id.toString() : "";
        const allTargets = Array.from(
          new Set(
            [
              callerId,
              myId,
              ...(Array.isArray(activeCall.members)
                ? activeCall.members.map((m) => (m?._id || m)?.toString())
                : [])
            ].filter(Boolean)
          )
        );

        socket.emit("RECORD_CALL", {
          chatId: activeCall.chatId,
          members: allTargets,
          callType: activeCall.callType || "audio",
          status,
          duration,
          isGroup: Boolean(activeCall.isGroup)
        });

        if (activeCall.isGroup) {
          socket.emit("LEAVE_GROUP_CALL", {
            chatId: activeCall.chatId,
            members: allTargets
          });
        } else {
          socket.emit("REJECT_CALL", {
            to: allTargets,
            chatId: activeCall.chatId
          });
        }
      }

      // Close WebRTC connection
      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.close();
        } catch (e) {
          console.warn("Error closing peer connection:", e);
        }
        peerConnectionRef.current = null;
      }

      // Close mesh connections for group call
      meshPeersRef.current.forEach((pc) => {
        try {
          pc.close();
        } catch (e) {
          console.warn("Error closing mesh peer connection:", e);
        }
      });
      meshPeersRef.current.clear();
      setRemoteStreams({});

      // Clear queued ICE candidates
      iceCandidatesQueue.current = [];

      // Stop media tracks
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

      setCallStatus("ended");
      setIsCaller(false);
      setIsMinimized(false);
      setCallStartTime(null);
      setIsMuted(false);
      setIsVideoEnabled(true);
    },
    [
      clearRingTimeout,
      callStatus,
      callStartTime,
      activeCall,
      socket,
      user,
      localStream,
      remoteStream,
      dispatch
    ]
  );

  // Start outgoing call
  const startCall = useCallback(
    async (callParams) => {
      const {
        chatId,
        members,
        callType,
        to,
        toName,
        toImage,
        isGroup = false,
        chatTitle = ""
      } = callParams;
      const isVideo = callType === "video";

      // Reset candidate queue
      iceCandidatesQueue.current = [];

      // Synchronously set status to calling IMMEDIATELY so UI shows "Calling..." without delay
      setCallStatus("calling");
      setIsCaller(true);
      setIsMinimized(false);

      // Play outgoing telephone dial/ringback tone
      callSounds.playOutgoingRing();

      // 30-Second Automatic Cut-off for Outgoing Call
      clearRingTimeout();
      ringTimeoutRef.current = setTimeout(() => {
        toast.warning("No answer. Call timed out after 30 seconds.");
        endCall("unanswered");
      }, 30000);

      try {
        await initializePeerConnection(members, chatId, isVideo);

        const pc = peerConnectionRef.current;
        const offerDescription = await pc.createOffer();
        await pc.setLocalDescription(offerDescription);

        socket.emit("CALL_USER", {
          offer: offerDescription,
          to: members,
          chatId,
          callType,
          isGroup: Boolean(isGroup),
          chatTitle: chatTitle || toName,
          callerInfo: {
            from: user?._id?.toString(),
            fromName: user?.name,
            avatar: user?.avatar
          }
        });
      } catch (err) {
        console.error("Error starting call:", err);
        callSounds.stopCallSounds();
        clearRingTimeout();
        setCallStatus("ended");
      }
    },
    [initializePeerConnection, clearRingTimeout, endCall, socket, user]
  );

  // Initiate call and navigate to full call page
  const initiateCall = useCallback(
    ({
      chatId,
      callType,
      to,
      toName,
      toImage,
      members,
      isGroup = false,
      chatTitle = ""
    }) => {
      dispatch(callStarted(true));

      // Prime and unlock audio element on caller gesture
      if (remoteAudioRef.current) {
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.volume = 1.0;
        remoteAudioRef.current.play().catch(() => {});
      }

      const myId = user?._id ? user._id.toString() : "";
      const targetId = (to?._id || to)?.toString();
      const participantList = Array.from(
        new Set(
          [
            myId,
            targetId,
            ...(Array.isArray(members)
              ? members.map((m) => (m?._id || m)?.toString())
              : [])
          ].filter(Boolean)
        )
      );

      const displayName = isGroup
        ? chatTitle || "Group Call"
        : toName;

      setActiveCall({
        chatId,
        callType,
        to: targetId,
        toName: displayName,
        toImage,
        members: participantList,
        isGroup: Boolean(isGroup),
        chatTitle
      });

      setCallStatus("calling");
      setIsCaller(true);
      setIsMinimized(false);

      navigate(
        `/call/${chatId}?type=${callType}&to=${targetId}&toName=${encodeURIComponent(
          displayName || ""
        )}&toImage=${encodeURIComponent(toImage || "")}&isGroup=${
          isGroup ? "true" : "false"
        }&chatTitle=${encodeURIComponent(chatTitle || "")}`
      );

      // Start WebRTC connection
      startCall({
        chatId,
        members: participantList,
        callType,
        to: targetId,
        toName: displayName,
        toImage,
        isGroup,
        chatTitle
      });
    },
    [dispatch, navigate, startCall, user]
  );

  // Answer an incoming call
  const handleAnswerCall = useCallback(async () => {
    const offerToUse = incomingOffer || activeCall?.offer;
    if (!offerToUse || !activeCall) {
      console.warn("No incoming offer or active call metadata to answer call", {
        incomingOffer,
        activeCall
      });
      return;
    }

    clearRingTimeout();
    callSounds.stopCallSounds();

    // Prime and unlock audio element directly within mobile user touch gesture
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = false;
      remoteAudioRef.current.volume = 1.0;
      remoteAudioRef.current.play().catch(() => {});
    }

    setCallStatus("connected");
    setCallStartTime(Date.now());

    const { chatId, callType } = activeCall;
    const isVideo = callType === "video";

    const callerId = (activeCall.from || activeCall.to)?.toString();
    const myId = user?._id ? user._id.toString() : "";
    const targetParticipants = Array.from(
      new Set(
        [
          callerId,
          myId,
          ...(Array.isArray(activeCall.members)
            ? activeCall.members.map((m) => (m?._id || m)?.toString())
            : [])
        ].filter(Boolean)
      )
    );

    try {
      await initializePeerConnection(targetParticipants, chatId, isVideo);

      const pc = peerConnectionRef.current;
      await pc.setRemoteDescription(new RTCSessionDescription(offerToUse));

      // Drain all queued ICE candidates that arrived before answering
      while (iceCandidatesQueue.current.length > 0) {
        const candidate = iceCandidatesQueue.current.shift();
        try {
          await pc.addIceCandidate(candidate);
        } catch (e) {
          console.warn("Error draining queued candidate on answer:", e);
        }
      }

      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);

      socket.emit("ANSWER_CALL", {
        answer: answerDescription,
        to: targetParticipants,
        chatId,
        isGroup: Boolean(activeCall?.isGroup)
      });

      if (activeCall?.isGroup) {
        socket.emit("GROUP_CALL_JOIN", {
          chatId,
          members: targetParticipants
        });
      }
    } catch (err) {
      console.error("Error answering call:", err);
      toast.error("Failed to answer call.");
      endCall("error");
    }
  }, [
    incomingOffer,
    activeCall,
    clearRingTimeout,
    initializePeerConnection,
    socket,
    endCall,
    user
  ]);

  // Toggle audio mute
  const muteAudio = useCallback(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextEnabled = !audioTracks[0].enabled;
        audioTracks[0].enabled = nextEnabled;
        setIsMuted(!nextEnabled);
      }
    }
  }, [localStream]);

  const [facingMode, setFacingMode] = useState("user");

  // Toggle video stream (enable/disable track or acquire camera if not present)
  const toggleVideo = useCallback(async () => {
    if (!localStream) return;

    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      const nextEnabled = !videoTracks[0].enabled;
      videoTracks[0].enabled = nextEnabled;
      setIsVideoEnabled(nextEnabled);
    } else if (peerConnectionRef.current) {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          toast.error("Camera access requires a secure context (HTTPS).");
          return;
        }
        const camStream = await navigator.mediaDevices
          .getUserMedia({ video: { facingMode: "user" } })
          .catch(() => navigator.mediaDevices.getUserMedia({ video: true }));

        const newTrack = camStream.getVideoTracks()[0];
        if (newTrack) {
          localStream.addTrack(newTrack);
          peerConnectionRef.current.addTrack(newTrack, localStream);
          setIsVideoEnabled(true);
        }
      } catch (err) {
        console.warn("Could not acquire video track:", err);
        toast.error("Camera access denied or unavailable.");
      }
    }
  }, [localStream]);

  // Flip / switch camera (front vs back)
  const switchCamera = useCallback(async () => {
    if (!localStream || !peerConnectionRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.info("Camera switching not supported in this browser context.");
      return;
    }
    const nextFacing = facingMode === "user" ? "environment" : "user";
    try {
      const newStream = await navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: { exact: nextFacing } }
        })
        .catch(() =>
          navigator.mediaDevices.getUserMedia({
            video: { facingMode: nextFacing }
          })
        );

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (newVideoTrack) {
        const oldVideoTrack = localStream.getVideoTracks()[0];
        if (oldVideoTrack) {
          localStream.removeTrack(oldVideoTrack);
          oldVideoTrack.stop();
          const senders = peerConnectionRef.current.getSenders();
          const videoSender = senders.find((s) => s.track?.kind === "video");
          if (videoSender) {
            await videoSender.replaceTrack(newVideoTrack);
          }
        }
        localStream.addTrack(newVideoTrack);
        setFacingMode(nextFacing);
        setIsVideoEnabled(true);
        toast.success(
          `Switched to ${nextFacing === "user" ? "front" : "rear"} camera`
        );
      }
    } catch (err) {
      console.warn("Could not switch camera:", err);
      toast.info("No alternative camera found.");
    }
  }, [localStream, facingMode]);

  // Minimize call and navigate to chat / background
  const minimizeCall = useCallback(() => {
    setIsMinimized(true);
    if (location.pathname.startsWith("/call")) {
      navigate("/chat");
    }
  }, [location.pathname, navigate]);

  // Maximize call and return to full call screen
  const maximizeCall = useCallback(() => {
    setIsMinimized(false);
    if (activeCall?.chatId) {
      navigate(
        `/call/${activeCall.chatId}?type=${activeCall.callType || "audio"}&to=${
          activeCall.to || ""
        }&toName=${encodeURIComponent(
          activeCall.toName || ""
        )}&toImage=${encodeURIComponent(activeCall.toImage || "")}`
      );
    }
  }, [activeCall, navigate]);

  // Return to chat after call ends
  const resetCallState = useCallback(() => {
    setCallStatus("idle");
    setActiveCall(null);
    navigate("/chat");
  }, [navigate]);

  // Global Socket Event Handlers
  useEffect(() => {
    if (!socket) return;

    // Incoming Call Handler
    const handleIncomingCall = ({
      chatId,
      callType,
      members,
      fromName,
      offer,
      from,
      callerInfo,
      isGroup = false,
      chatTitle = ""
    }) => {
      dispatch(setMembers(members));
      dispatch(setIncomingOffer(offer));
      dispatch(setCallerDetails({ from, fromName, callerInfo }));

      const callerId = (from || callerInfo?.from)?.toString();
      const myId = user?._id ? user._id.toString() : "";
      const participantList = Array.from(
        new Set(
          [
            callerId,
            myId,
            ...(Array.isArray(members)
              ? members.map((m) => (m?._id || m)?.toString())
              : [])
          ].filter(Boolean)
        )
      );

      const displayName = isGroup
        ? chatTitle || "Group Call"
        : fromName || "Friend";

      const callData = {
        chatId,
        callType,
        members: participantList,
        from: callerId,
        fromName,
        to: callerId,
        toName: displayName,
        toImage: isGroup ? "" : callerInfo?.avatar,
        callerInfo,
        offer,
        isGroup: Boolean(isGroup),
        chatTitle
      };

      // Reset candidate queue for fresh incoming call
      iceCandidatesQueue.current = [];

      setActiveCall(callData);
      setIsCaller(false);
      setCallStatus("incoming");
      setIsMinimized(false);

      // Play melodic incoming call chime
      callSounds.playIncomingRing();

      // 30-Second Automatic Cut-off for Incoming Call
      clearRingTimeout();
      ringTimeoutRef.current = setTimeout(() => {
        toast.info("Missed call (timed out after 30s)");
        endCall("missed");
      }, 30000);

      navigate(
        `/call/${chatId}?type=${callType}&from=${callerId}&name=${encodeURIComponent(
          displayName
        )}&isGroup=${isGroup ? "true" : "false"}&chatTitle=${encodeURIComponent(
          chatTitle || ""
        )}`
      );
    };

    // Call Answered by Remote Peer (Received on Caller Device)
    const handleCallAnswered = async (data) => {
      clearRingTimeout();
      callSounds.stopCallSounds();

      const answerDesc = data?.answer?.type
        ? data.answer
        : data?.answer || data;

      try {
        const pc = peerConnectionRef.current;
        if (pc) {
          if (pc.signalingState !== "stable") {
            await pc.setRemoteDescription(new RTCSessionDescription(answerDesc));
          }

          while (iceCandidatesQueue.current.length > 0) {
            const candidate = iceCandidatesQueue.current.shift();
            try {
              await pc.addIceCandidate(candidate);
            } catch (e) {
              console.warn("Error draining queued candidate on caller:", e);
            }
          }

          setCallStatus("connected");
          setCallStartTime(Date.now());
        }
      } catch (error) {
        console.error("Error setting remote description on caller:", error);
      }
    };

    // Group Call Mesh Event Handlers
    const handleGroupUserJoined = async ({ userId, userName, avatar, chatId }) => {
      const myId = user?._id?.toString();
      if (!localStream || userId === myId) return;

      try {
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" }
          ]
        });

        meshPeersRef.current.set(userId, pc);

        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });

        pc.onicecandidate = (event) => {
          if (event.candidate && socket) {
            socket.emit("GROUP_CALL_ICE", {
              to: userId,
              candidate: event.candidate,
              chatId
            });
          }
        };

        pc.ontrack = (event) => {
          const stream =
            event.streams && event.streams[0]
              ? event.streams[0]
              : new MediaStream([event.track]);
          setRemoteStreams((prev) => ({
            ...prev,
            [userId]: { stream, name: userName || "Participant", avatar }
          }));
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("GROUP_CALL_OFFER", {
          to: userId,
          offer,
          chatId
        });
      } catch (e) {
        console.error("Error creating group offer to joined user:", e);
      }
    };

    const handleGroupOffer = async ({ from, fromName, avatar, offer, chatId }) => {
      if (!localStream) return;
      try {
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" }
          ]
        });

        meshPeersRef.current.set(from, pc);

        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });

        pc.onicecandidate = (event) => {
          if (event.candidate && socket) {
            socket.emit("GROUP_CALL_ICE", {
              to: from,
              candidate: event.candidate,
              chatId
            });
          }
        };

        pc.ontrack = (event) => {
          const stream =
            event.streams && event.streams[0]
              ? event.streams[0]
              : new MediaStream([event.track]);
          setRemoteStreams((prev) => ({
            ...prev,
            [from]: { stream, name: fromName || "Participant", avatar }
          }));
        };

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("GROUP_CALL_ANSWER", {
          to: from,
          answer,
          chatId
        });
      } catch (e) {
        console.error("Error handling group offer:", e);
      }
    };

    const handleGroupAnswer = async ({ from, answer }) => {
      const pc = meshPeersRef.current.get(from);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (e) {
          console.error("Error setting group answer:", e);
        }
      }
    };

    const handleGroupIce = async ({ from, candidate }) => {
      const pc = meshPeersRef.current.get(from);
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn("Error adding group ICE candidate:", e);
        }
      }
    };

    const handleGroupUserLeft = ({ userId, userName }) => {
      const pc = meshPeersRef.current.get(userId);
      if (pc) {
        try {
          pc.close();
        } catch (e) {}
        meshPeersRef.current.delete(userId);
      }
      setRemoteStreams((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
      if (userName) {
        toast.info(`${userName} left the group call`);
      }
    };

    // ICE Candidate Exchange
    const handleIceCandidate = async (data) => {
      const { candidate } = data;
      if (!candidate) return;

      const rtcCandidate = new RTCIceCandidate(candidate);
      const pc = peerConnectionRef.current;

      if (
        pc &&
        pc.remoteDescription &&
        pc.remoteDescription.type
      ) {
        try {
          await pc.addIceCandidate(rtcCandidate);
        } catch (error) {
          console.warn("Error adding incoming ICE candidate:", error);
        }
      } else {
        // Queue candidates until peerConnection and remoteDescription are ready
        iceCandidatesQueue.current.push(rtcCandidate);
      }
    };

    // Call Rejected / Ended by Peer
    const handleCallRejected = () => {
      clearRingTimeout();
      callSounds.stopCallSounds();
      toast.info("Call ended");
      endCall();
    };

    // Peer Offline
    const handleUserOffline = () => {
      clearRingTimeout();
      callSounds.stopCallSounds();
      toast.error("User is currently offline");
      endCall("unanswered");
    };

    socket.on("INCOMING_CALL", handleIncomingCall);
    socket.on("CALL_ANSWERED", handleCallAnswered);
    socket.on("ICE_CANDIDATE", handleIceCandidate);
    socket.on("CALL_REJECTED", handleCallRejected);
    socket.on("USER_OFFLINE", handleUserOffline);
    socket.on("GROUP_CALL_USER_JOINED", handleGroupUserJoined);
    socket.on("GROUP_CALL_OFFER", handleGroupOffer);
    socket.on("GROUP_CALL_ANSWER", handleGroupAnswer);
    socket.on("GROUP_CALL_ICE", handleGroupIce);
    socket.on("GROUP_CALL_USER_LEFT", handleGroupUserLeft);

    return () => {
      socket.off("INCOMING_CALL", handleIncomingCall);
      socket.off("CALL_ANSWERED", handleCallAnswered);
      socket.off("ICE_CANDIDATE", handleIceCandidate);
      socket.off("CALL_REJECTED", handleCallRejected);
      socket.off("USER_OFFLINE", handleUserOffline);
      socket.off("GROUP_CALL_USER_JOINED", handleGroupUserJoined);
      socket.off("GROUP_CALL_OFFER", handleGroupOffer);
      socket.off("GROUP_CALL_ANSWER", handleGroupAnswer);
      socket.off("GROUP_CALL_ICE", handleGroupIce);
      socket.off("GROUP_CALL_USER_LEFT", handleGroupUserLeft);
      clearRingTimeout();
      callSounds.stopCallSounds();
    };
  }, [socket, dispatch, navigate, endCall, clearRingTimeout, user, localStream]);

  const value = {
    callStatus,
    isInCall: callStatus === "connected",
    isRinging: callStatus === "calling" || callStatus === "incoming",
    localStream,
    remoteStream,
    remoteStreams,
    isGroup: Boolean(activeCall?.isGroup),
    isCaller,
    isMinimized,
    isMuted,
    isVideoEnabled,
    activeCall,
    callStartTime,
    initiateCall,
    startCall,
    handleAnswerCall,
    endCall,
    muteAudio,
    toggleVideo,
    switchCamera,
    facingMode,
    minimizeCall,
    maximizeCall,
    resetCallState,
    setActiveCall
  };

  return (
    <CallContext.Provider value={value}>
      {children}
      {/* Persistent remote audio element positioned off-screen to avoid mobile display:none audio suspension */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none"
        }}
      />
      {/* Dynamic audio elements for all mesh peers in group calls */}
      {Object.entries(remoteStreams).map(([peerId, peerData]) => (
        <audio
          key={peerId}
          autoPlay
          playsInline
          ref={(el) => {
            if (el && peerData.stream && el.srcObject !== peerData.stream) {
              peerData.stream.getAudioTracks().forEach((t) => (t.enabled = true));
              el.srcObject = peerData.stream;
              el.muted = false;
              el.volume = 1.0;
              el.play().catch(() => {});
            }
          }}
          style={{
            position: "fixed",
            top: "-9999px",
            left: "-9999px",
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none"
          }}
        />
      ))}
    </CallContext.Provider>
  );
};
