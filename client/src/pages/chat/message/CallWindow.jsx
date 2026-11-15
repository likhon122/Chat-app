import React, { useRef, useEffect, useState, memo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPhoneSlash,
  FaPhone,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaExpand,
  FaCompress,
  FaArrowLeft,
  FaMinus,
  FaUsers
} from "react-icons/fa6";
import { HiShieldCheck, HiLockClosed, HiArrowPath } from "react-icons/hi2";

// Peer Video Tile for Multi-Participant Group Video Calls
const PeerVideoTile = memo(({ peerId, peerData }) => {
  const videoRef = useRef(null);
  const stream = peerData?.stream;
  const hasVideo =
    Boolean(stream) &&
    stream.getVideoTracks().length > 0 &&
    stream.getVideoTracks().some((t) => t.enabled);

  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play?.().catch(() => {});
      }
    }
  }, [stream]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black/80 border border-white/10 aspect-video flex items-center justify-center shadow-lg group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={true}
        className={`w-full h-full object-cover ${!hasVideo ? "hidden" : ""}`}
      />
      {!hasVideo && (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          {peerData?.avatar ? (
            <img
              src={peerData.avatar}
              alt={peerData.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-cyan-400/40 shadow-lg mb-2"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg mb-2">
              {peerData?.name?.charAt(0)?.toUpperCase() || "P"}
            </div>
          )}
          <span className="text-xs font-semibold text-gray-300">
            {peerData?.name || "Participant"}
          </span>
          <span className="text-[10px] text-gray-500 mt-0.5">Camera off</span>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-white px-2 py-0.5 rounded-lg border border-white/10 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>{peerData?.name || "Participant"}</span>
      </div>
    </div>
  );
});

PeerVideoTile.displayName = "PeerVideoTile";

// Peer Audio Tile for Multi-Participant Group Voice Calls
const PeerAudioTile = memo(({ peerId, peerData }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.04] border border-white/10 shadow-lg min-w-[130px] sm:min-w-[150px] relative">
      <div className="relative mb-3">
        <div className="absolute -inset-2 rounded-full bg-cyan-500/20 animate-pulse" />
        {peerData?.avatar ? (
          <img
            src={peerData.avatar}
            alt={peerData.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-cyan-400 shadow-md relative z-10"
          />
        ) : (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md relative z-10">
            {peerData?.name?.charAt(0)?.toUpperCase() || "P"}
          </div>
        )}
      </div>
      <h4 className="text-xs font-bold text-white truncate max-w-[120px] text-center">
        {peerData?.name || "Participant"}
      </h4>
      <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Connected</span>
      </div>
    </div>
  );
});

PeerAudioTile.displayName = "PeerAudioTile";

// Ultra-performance Call Duration Timer: Updates only itself every 1s
const CallDurationTimer = memo(({ startTime }) => {
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    const start = startTime || Date.now();
    const tick = () => {
      const totalSec = Math.max(0, Math.floor((Date.now() - start) / 1000));
      const m = Math.floor(totalSec / 60)
        .toString()
        .padStart(2, "0");
      const s = (totalSec % 60).toString().padStart(2, "0");
      setElapsed(`${m}:${s}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span>{elapsed}</span>;
});

CallDurationTimer.displayName = "CallDurationTimer";

// Visualizer Bars for Audio Calls
const AudioWaveVisualizer = memo(() => {
  return (
    <div className="flex items-center justify-center gap-1.5 h-8 my-3">
      {[40, 75, 55, 90, 60, 100, 70, 85, 45, 95, 65, 80, 50, 70].map(
        (height, i) => (
          <span
            key={i}
            className="w-1 bg-gradient-to-t from-cyan-500 to-blue-400 rounded-full animate-pulse"
            style={{
              height: `${height}%`,
              animationDuration: `${0.8 + (i % 5) * 0.2}s`,
              animationDelay: `${(i % 4) * 0.15}s`
            }}
          />
        )
      )}
    </div>
  );
});

AudioWaveVisualizer.displayName = "AudioWaveVisualizer";

const CallWindow = ({
  callStatus = "idle",
  localStream,
  remoteStream,
  remoteStreams = {},
  isGroup = false,
  chatTitle = "",
  onEndCall,
  isVideoCall,
  isCaller = false,
  handleAnswerCall,
  handleRejectCall,
  resetCallState,
  muteAudio,
  toggleVideo,
  switchCamera,
  isMuted,
  isVideoEnabled,
  toImage,
  toName,
  onMinimize
}) => {
  const navigate = useNavigate();
  const callerDetails = useSelector((state) => state.other.callerDetails);

  const [callStartTime, setCallStartTime] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  const callerAvatar = callerDetails?.callerInfo?.avatar;
  const callName =
    chatTitle ||
    toName ||
    callerDetails?.callerInfo?.fromName ||
    callerDetails?.fromName ||
    (isGroup ? "Group Call" : "Friend");
  const callAvatar = toImage || callerAvatar;

  const remoteEntries = Object.entries(remoteStreams || {});
  const isMultiParticipant = isGroup && remoteEntries.length > 1;

  const hasRemoteVideo =
    Boolean(remoteStream) &&
    remoteStream.getVideoTracks().length > 0 &&
    remoteStream.getVideoTracks().some((t) => t.enabled);

  // Track call start time when active call connects
  useEffect(() => {
    if (callStatus === "connected" && !callStartTime) {
      setCallStartTime(Date.now());
    } else if (callStatus !== "connected") {
      setCallStartTime(null);
    }
  }, [callStatus, callStartTime]);

  // Video stream attachment
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      if (remoteVideoRef.current.srcObject !== remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play?.().catch(() => {});
      }
    }
  }, [remoteStream, callStatus, isVideoCall]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      if (localVideoRef.current.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play?.().catch(() => {});
      }
    }
  }, [localStream, callStatus, isVideoCall]);

  const handleDisconnectCall = () => {
    if (onMinimize) {
      onMinimize();
    } else {
      navigate("/chat");
    }
  };

  const handleReturnToChat = () => {
    if (resetCallState) {
      resetCallState();
    } else {
      navigate("/chat");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <div className="w-full h-full max-h-full overflow-hidden flex flex-col relative bg-[#08090d] select-none">
      {/* Cyber ambient background lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/[0.07] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/[0.07] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Blurred background aura when avatar exists */}
      {callAvatar && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 blur-3xl pointer-events-none scale-110"
          style={{ backgroundImage: `url(${callAvatar})` }}
        />
      )}

      {/* ========================================================
          1. OUTGOING CALL SCREEN (Calling peer)
         ======================================================== */}
      <AnimatePresence mode="wait">
        {callStatus === "calling" && (
          <motion.div
            key="calling-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 sm:p-8 relative z-20"
          >
            <div className="flex flex-col items-center text-center max-w-md w-full p-8 rounded-3xl bg-white/[0.03] dark:bg-[#12131a]/80 backdrop-blur-2xl border border-white/10 shadow-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold mb-8 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>
                  {isGroup ? "GROUP CALL" : "CALLING..."} ({isVideoCall ? "VIDEO" : "VOICE"})
                </span>
              </div>

              {/* Avatar with Animated Pulsing Ripple */}
              <div className="relative mb-6">
                <div className="absolute -inset-4 rounded-full bg-cyan-500/20 animate-ping opacity-50" />
                <div className="absolute -inset-8 rounded-full bg-blue-500/10 animate-pulse" />

                {isGroup ? (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-extrabold border-4 border-cyan-500/40 shadow-2xl relative z-10">
                    <FaUsers className="w-12 h-12 text-cyan-200" />
                  </div>
                ) : callAvatar ? (
                  <img
                    src={callAvatar}
                    alt={callName}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-cyan-500/40 shadow-2xl relative z-10"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-extrabold border-4 border-cyan-500/40 shadow-2xl relative z-10">
                    {callName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Peer / Group Name */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
                {callName}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mb-8">
                {isGroup
                  ? "Calling group members... (30s auto cut-off if unanswered)"
                  : "Ringing peer... (30s auto cut-off if unanswered)"}
              </p>

              {/* Action Button: Cancel Call */}
              <div className="flex items-center justify-center gap-6 w-full">
                <button
                  type="button"
                  onClick={onEndCall}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 hover:scale-105 active:scale-95 transition cursor-pointer"
                  title="Cancel Call"
                >
                  <FaPhoneSlash className="text-2xl" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          2. INCOMING CALL SCREEN (Ringing from remote caller)
         ======================================================== */}
      <AnimatePresence mode="wait">
        {callStatus === "incoming" && (
          <motion.div
            key="incoming-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 sm:p-8 relative z-20"
          >
            <div className="flex flex-col items-center text-center max-w-md w-full p-8 rounded-3xl bg-white/[0.03] dark:bg-[#12131a]/80 backdrop-blur-2xl border border-white/10 shadow-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-8 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  {isGroup ? "INCOMING GROUP CALL" : "INCOMING CALL"} ({isVideoCall ? "VIDEO" : "VOICE"})
                </span>
              </div>

              {/* Avatar with Animated Pulsing Ripple */}
              <div className="relative mb-6">
                <div className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping opacity-50" />
                <div className="absolute -inset-8 rounded-full bg-cyan-500/10 animate-pulse" />

                {isGroup ? (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white text-4xl font-extrabold border-4 border-emerald-500/40 shadow-2xl relative z-10">
                    <FaUsers className="w-12 h-12 text-emerald-200" />
                  </div>
                ) : callAvatar ? (
                  <img
                    src={callAvatar}
                    alt={callName}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-emerald-500/40 shadow-2xl relative z-10"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white text-4xl font-extrabold border-4 border-emerald-500/40 shadow-2xl relative z-10">
                    {callName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Caller / Group Name */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
                {callName}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mb-8">
                {isGroup
                  ? `${callerDetails?.callerInfo?.fromName || callerDetails?.fromName || "A member"} started a group ${isVideoCall ? "video" : "voice"} call`
                  : isVideoCall
                  ? "Incoming peer-to-peer 1080p video call"
                  : "Incoming peer-to-peer crystal voice call"}
              </p>

              {/* Action Buttons: Reject & Answer */}
              <div className="flex items-center justify-center gap-8 w-full">
                {/* Reject */}
                <button
                  type="button"
                  onClick={handleRejectCall}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 hover:scale-105 active:scale-95 transition cursor-pointer"
                  title="Decline Call"
                >
                  <FaPhoneSlash className="text-2xl" />
                </button>

                {/* Answer */}
                <button
                  type="button"
                  onClick={handleAnswerCall}
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 hover:scale-105 active:scale-95 transition relative group cursor-pointer"
                  title="Answer Call"
                >
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30 pointer-events-none" />
                  <FaPhone className="text-2xl" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          3. ACTIVE CONNECTED CALL SCREEN (Video or Audio)
         ======================================================== */}
      {callStatus === "connected" && (
        <div className="flex-1 min-h-0 flex flex-col h-full relative z-20">
          {/* Top In-Call Header Capsule */}
          <div className="flex-shrink-0 px-3 sm:px-6 py-2 sm:py-2.5">
            <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-2 rounded-2xl bg-white/[0.04] dark:bg-[#12131a]/70 backdrop-blur-xl border border-white/10 shadow-lg">
              {/* Left: Return + Peer identity */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={handleDisconnectCall}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Back to chat (call stays active in background)"
                >
                  <FaArrowLeft className="w-4 h-4" />
                </button>

                <div className="relative flex-shrink-0">
                  {isGroup ? (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      <FaUsers className="w-4 h-4 text-cyan-200" />
                    </div>
                  ) : callAvatar ? (
                    <img
                      src={callAvatar}
                      alt={callName}
                      className="w-9 h-9 rounded-xl object-cover border border-white/20"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {callName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#08090d] animate-pulse" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                    {callName}
                  </h3>
                  <p className="text-[10px] text-cyan-400/90 font-medium truncate flex items-center gap-1">
                    <HiShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                    <span>
                      {isGroup
                        ? `Group Call (${remoteEntries.length + 1} connected)`
                        : isVideoCall
                        ? "WebRTC HD Video"
                        : "Opus HD Voice"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Center: Live Call Timer */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold text-gray-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <CallDurationTimer startTime={callStartTime} />
              </div>

              {/* Right: Security, Fullscreen & Minimize */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="hidden md:flex items-center gap-1 text-[11px] text-gray-400 font-medium px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                  <HiLockClosed className="w-3 h-3 text-emerald-400" />
                  <span>P2P Direct</span>
                </div>

                {/* Minimize Button */}
                <button
                  type="button"
                  onClick={handleDisconnectCall}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Minimize Call (continue in background)"
                >
                  <FaMinus className="w-3.5 h-3.5" />
                </button>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? (
                    <FaCompress className="w-3.5 h-3.5" />
                  ) : (
                    <FaExpand className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Center Stage: Video Viewport or Audio Stage */}
          <div className="flex-1 min-h-0 px-3 sm:px-6 py-1 flex items-center justify-center relative overflow-hidden">
            {isVideoCall ? (
              /* ================= VIDEO CALL VIEWPORT ================= */
              isMultiParticipant ? (
                /* Multi-Participant Group Video Grid */
                <div className="w-full h-full max-h-full rounded-2xl sm:rounded-3xl border border-white/10 bg-black/60 shadow-2xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 overflow-y-auto custom-scrollbar">
                  {/* Each remote peer tile */}
                  {remoteEntries.map(([peerId, peerData]) => (
                    <PeerVideoTile
                      key={peerId}
                      peerId={peerId}
                      peerData={peerData}
                    />
                  ))}
                  {/* Self view tile in grid */}
                  <div className="relative rounded-2xl overflow-hidden bg-black/80 border-2 border-cyan-500/30 aspect-video flex items-center justify-center shadow-lg group">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className={`w-full h-full object-cover -scale-x-100 ${
                        !isVideoEnabled ? "hidden" : ""
                      }`}
                    />
                    {!isVideoEnabled && (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-900/90 p-2 text-center">
                        <FaVideoSlash className="w-5 h-5 mb-1 text-rose-400" />
                        <span className="text-[10px] font-medium">Camera Off</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-white px-2 py-0.5 rounded-lg border border-white/10">
                      You
                    </div>
                  </div>
                </div>
              ) : (
                /* Single Peer Video Viewport */
                <div className="relative w-full h-full max-h-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl flex items-center justify-center">
                  {/* Remote Stream Video Element */}
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    muted={true}
                    className={`w-full h-full object-cover ${
                      !hasRemoteVideo ? "hidden" : ""
                    }`}
                  />

                  {/* Fallback Overlay if remote video is waiting or paused */}
                  {!hasRemoteVideo && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0f17]/95 p-6 text-center z-10">
                      <div className="relative mb-5">
                        <div className="absolute -inset-4 rounded-full bg-cyan-500/10 animate-pulse" />
                        {callAvatar ? (
                          <img
                            src={callAvatar}
                            alt={callName}
                            className="w-24 h-24 rounded-full object-cover border-2 border-white/20 shadow-xl relative z-10"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-3xl font-extrabold border-2 border-white/20 shadow-xl relative z-10">
                            {callName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-white mb-1">
                        Connecting with {callName}...
                      </h4>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        Awaiting video feed from peer
                      </p>
                    </div>
                  )}

                  {/* Self View (Local Stream PiP) */}
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-28 sm:w-44 aspect-[3/4] sm:aspect-video rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/80 z-20 transition group">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className={`w-full h-full object-cover -scale-x-100 ${
                        !isVideoEnabled ? "hidden" : ""
                      }`}
                    />
                    {!isVideoEnabled && (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-900/90 p-2 text-center">
                        <FaVideoSlash className="w-5 h-5 mb-1 text-rose-400" />
                        <span className="text-[10px] font-medium">Camera Off</span>
                      </div>
                    )}
                    <div className="absolute bottom-1 left-2 bg-black/60 backdrop-blur-sm text-[9px] font-semibold text-white px-1.5 py-0.5 rounded">
                      You
                    </div>
                  </div>

                  {/* Video Quality Pill */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium py-1 px-2.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>HD 1080p • 60 FPS</span>
                  </div>
                </div>
              )
            ) : (
              /* ================= AUDIO CALL VIEWPORT ================= */
              <div className="w-full h-full max-h-full rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
                {isMultiParticipant ? (
                  /* Multi-Participant Group Voice Stage */
                  <div className="flex flex-col items-center justify-center w-full max-w-2xl">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 tracking-tight">
                      {callName}
                    </h3>
                    <p className="text-xs sm:text-sm text-cyan-400 font-medium mb-6 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Group Voice Call • {remoteEntries.length + 1} Participants
                    </p>

                    {/* Participant Grid */}
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6 max-h-[45vh] overflow-y-auto custom-scrollbar p-2">
                      {remoteEntries.map(([peerId, peerData]) => (
                        <PeerAudioTile
                          key={peerId}
                          peerId={peerId}
                          peerData={peerData}
                        />
                      ))}
                    </div>

                    <AudioWaveVisualizer />
                  </div>
                ) : (
                  /* Single Peer Audio Stage */
                  <>
                    <div className="relative mb-6">
                      <div className="absolute -inset-4 rounded-full bg-cyan-500/20 animate-pulse" />
                      <div className="absolute -inset-8 rounded-full bg-blue-500/10 animate-pulse delay-150" />

                      {isGroup ? (
                        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-extrabold border-4 border-cyan-500/40 shadow-2xl relative z-10">
                          <FaUsers className="w-14 h-14 text-cyan-200" />
                        </div>
                      ) : callAvatar ? (
                        <img
                          src={callAvatar}
                          alt={callName}
                          className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-cyan-500/40 shadow-2xl relative z-10"
                        />
                      ) : (
                        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-extrabold border-4 border-cyan-500/40 shadow-2xl relative z-10">
                          {callName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5 tracking-tight">
                      {callName}
                    </h3>
                    <p className="text-xs sm:text-sm text-cyan-400 font-medium mb-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Voice Call in Progress • Opus 48kHz
                    </p>

                    <AudioWaveVisualizer />
                  </>
                )}

                {/* Mute Alert */}
                {isMuted && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold mt-2 animate-bounce">
                    <FaMicrophoneSlash className="w-3.5 h-3.5" />
                    <span>Your microphone is muted</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================= CALL CONTROL BAR DOCK ================= */}
          <div className="flex-shrink-0 px-4 py-3 sm:py-3.5 flex justify-center items-center">
            <div className="flex items-center gap-3 sm:gap-4 px-5 py-2.5 rounded-full bg-white/[0.06] dark:bg-[#12131a]/90 backdrop-blur-2xl border border-white/10 shadow-2xl">
              {/* Microphone Toggle */}
              <button
                type="button"
                onClick={muteAudio}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${
                  isMuted
                    ? "bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30 shadow-md shadow-rose-500/20"
                    : "bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10 shadow-sm"
                }`}
                title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {isMuted ? (
                  <FaMicrophoneSlash className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <FaMicrophone className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              {/* Video Toggle (Only for Video Calls) */}
              {isVideoCall && (
                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${
                    !isVideoEnabled
                      ? "bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30 shadow-md shadow-rose-500/20"
                      : "bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10 shadow-sm"
                  }`}
                  title={
                    !isVideoEnabled ? "Turn on Camera" : "Turn off Camera"
                  }
                >
                  {!isVideoEnabled ? (
                    <FaVideoSlash className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <FaVideo className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              )}

              {/* Flip / Switch Camera (Only for Video Calls) */}
              {isVideoCall && switchCamera && (
                <button
                  type="button"
                  onClick={switchCamera}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition active:scale-95 bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10 shadow-sm cursor-pointer"
                  title="Switch Front/Rear Camera"
                >
                  <HiArrowPath className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* End Call Button */}
              <button
                type="button"
                onClick={onEndCall}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 hover:scale-105 transition cursor-pointer"
                title="End Call"
              >
                <FaPhoneSlash className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. CALL ENDED SCREEN
         ======================================================== */}
      <AnimatePresence mode="wait">
        {callStatus === "ended" && (
          <motion.div
            key="call-ended-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 sm:p-8 relative z-20"
          >
            <div className="flex flex-col items-center text-center max-w-sm w-full p-8 rounded-3xl bg-white/[0.03] dark:bg-[#12131a]/80 backdrop-blur-2xl border border-white/10 shadow-2xl">
              {/* Disconnected Icon */}
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-5 shadow-inner">
                <FaPhoneSlash className="text-2xl" />
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
                Call Ended
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                Your encrypted peer-to-peer session with{" "}
                <span className="text-gray-200 font-semibold">{callName}</span>{" "}
                has ended safely.
              </p>

              {/* Return to Chat Button with Home Page Gradient */}
              <button
                type="button"
                onClick={handleReturnToChat}
                className="btn-grad text-white text-sm font-bold px-8 py-3 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                Return to Chat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          5. IDLE / FALLBACK SCREEN (No active call)
         ======================================================== */}
      <AnimatePresence mode="wait">
        {callStatus === "idle" && (
          <motion.div
            key="call-idle-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 sm:p-8 relative z-20"
          >
            <div className="flex flex-col items-center text-center max-w-sm w-full p-8 rounded-3xl bg-white/[0.03] dark:bg-[#12131a]/80 backdrop-blur-2xl border border-white/10 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5 shadow-inner">
                <FaPhone className="text-2xl" />
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
                No Active Call
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                There is no ongoing call session at this moment. You can start a voice or video call directly from any chat.
              </p>

              <button
                type="button"
                onClick={handleReturnToChat}
                className="btn-grad text-white text-sm font-bold px-8 py-3 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                Return to Chat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(CallWindow);
