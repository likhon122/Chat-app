import React, { useRef, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPhoneSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaExpand
} from "react-icons/fa6";
import { HiShieldCheck } from "react-icons/hi2";
import { useCall } from "../../context/CallContext";

// Isolated lightweight Call Timer
const MinimizedCallTimer = memo(({ startTime }) => {
  const [elapsed, setElapsed] = React.useState("00:00");

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

MinimizedCallTimer.displayName = "MinimizedCallTimer";

const MinimizedCallWidget = () => {
  const {
    callStatus,
    isMinimized,
    remoteStream,
    activeCall,
    callStartTime,
    isMuted,
    muteAudio,
    endCall,
    maximizeCall
  } = useCall();

  const miniVideoRef = useRef(null);

  // Attach remote video stream if video call
  useEffect(() => {
    if (miniVideoRef.current && remoteStream) {
      if (miniVideoRef.current.srcObject !== remoteStream) {
        miniVideoRef.current.srcObject = remoteStream;
      }
    }
  }, [remoteStream, isMinimized, callStatus]);

  if (
    !isMinimized ||
    (callStatus !== "connected" && callStatus !== "calling")
  ) {
    return null;
  }

  const isVideo = activeCall?.callType === "video";
  const callName = activeCall?.toName || activeCall?.fromName || "Friend";
  const callAvatar = activeCall?.toImage || activeCall?.callerInfo?.avatar;

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragElastic={0.1}
        dragConstraints={{ left: -400, right: 0, top: -600, bottom: 0 }}
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 30 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 select-none cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl bg-[#0e1017]/95 dark:bg-[#0c0d12]/95 backdrop-blur-2xl border border-white/15 hover:border-cyan-500/50 shadow-2xl shadow-black/80 transition-all duration-200 w-72 sm:w-80 group">
          {/* Left Media Preview Tile */}
          <div
            onClick={maximizeCall}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-black/60 border border-white/10 shrink-0 relative flex items-center justify-center cursor-pointer shadow-inner"
            title="Click to expand call"
          >
            {isVideo && remoteStream ? (
              <video
                ref={miniVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover pointer-events-none"
              />
            ) : callAvatar ? (
              <img
                src={callAvatar}
                alt={callName}
                className="w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-extrabold text-lg">
                {callName?.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Glowing online status indicator */}
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#0e1017] shadow-sm animate-pulse" />
          </div>

          {/* Center Identity & Duration */}
          <div
            onClick={maximizeCall}
            className="flex-1 min-w-0 cursor-pointer"
            title="Click to expand call"
          >
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                {callName}
              </h4>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-gray-300 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <MinimizedCallTimer startTime={callStartTime} />
              <span className="text-gray-500">•</span>
              <span className="text-[10px] text-cyan-400/90 font-medium">
                {isVideo ? "Video" : "Voice"}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[9px] text-gray-400 mt-0.5">
              <HiShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Encrypted P2P</span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mute Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                muteAudio();
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition active:scale-90 ${
                isMuted
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30"
                  : "bg-white/10 text-gray-300 hover:text-white hover:bg-white/20"
              }`}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? (
                <FaMicrophoneSlash className="w-3 h-3" />
              ) : (
                <FaMicrophone className="w-3 h-3" />
              )}
            </button>

            {/* End Call */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                endCall();
              }}
              className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-90 text-white flex items-center justify-center shadow-md shadow-rose-600/30 transition"
              title="End Call"
            >
              <FaPhoneSlash className="w-3 h-3" />
            </button>

            {/* Maximize */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                maximizeCall();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-gray-300 hover:text-white flex items-center justify-center transition"
              title="Maximize Call"
            >
              <FaExpand className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default memo(MinimizedCallWidget);

