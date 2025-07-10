import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPhoneSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash
} from "react-icons/fa";

const CallWindow = ({
  localStream,
  remoteStream,
  onEndCall,
  isVideoCall,
  isRinging,
  isInCall,
  handleAnswerCall,
  handleRejectCall,
  muteAudio,
  toggleVideo,
  isMuted,
  isVideoEnabled,
  toImage,
  toName,
  to
}) => {
  const navigate = useNavigate();
  const callerDetails = useSelector((state) => state.other.callerDetails);

  const handleDisconnectCall = () => {
    navigate(`/chat`);
  };

  const callerAvatar = callerDetails?.callerInfo?.avatar;
  const callName = callerDetails?.callerInfo?.fromName || toName;
  const callAvatar = callerAvatar || toImage;

  // Call animation for incoming calls
  const ringAnimation = {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Background blur effect */}
      {callAvatar && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${callAvatar})` }}
          />
          <div className="absolute inset-0 backdrop-blur-3xl bg-black/40"></div>
        </>
      )}

      {/* Content */}
      <div className="relative z-10 flex-grow flex flex-col h-full">
        {/* Incoming call screen */}
        <AnimatePresence>
          {isRinging && !isInCall && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center h-full p-8"
            >
              <motion.div
                animate={ringAnimation}
                className="text-lg font-medium text-blue-400 tracking-wider mb-10"
              >
                INCOMING CALL
              </motion.div>

              <motion.div
                className="relative"
                animate={{
                  y: [0, -10, 0],
                  transition: { duration: 2, repeat: Infinity }
                }}
              >
                <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                <div
                  className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"
                  style={{ animationDelay: "0.5s" }}
                ></div>

                {callAvatar ? (
                  <motion.img
                    src={callAvatar}
                    alt={`${callName}'s avatar`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl relative z-10"
                  />
                ) : (
                  <motion.div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl relative z-10">
                    {callName?.charAt(0)}
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                className="text-3xl font-bold text-white mt-6 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {callName}
              </motion.div>

              <motion.div
                className="text-blue-300 mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {isVideoCall ? "Video Call" : "Audio Call"}
              </motion.div>

              <div className="flex items-center justify-center gap-8 mt-6">
                <motion.button
                  onClick={handleRejectCall}
                  className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPhoneSlash className="text-2xl" />
                </motion.button>

                <motion.button
                  onClick={handleAnswerCall}
                  className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-600/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPhoneSlash className="text-2xl rotate-[135deg]" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active call screen */}
        <AnimatePresence>
          {isInCall && (
            <motion.div
              className="flex flex-col h-full p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="relative">
                    {callAvatar ? (
                      <img
                        src={callAvatar}
                        alt={`${callName}'s avatar`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-white">
                        {callName?.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="ml-3">
                    <div className="text-xl font-semibold text-white">
                      {callName}
                    </div>
                    <div className="text-xs text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                      <span>{isVideoCall ? "Video Call" : "Audio Call"}</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-300 bg-gray-800/50 py-1 px-3 rounded-full">
                  <span id="call-timer">00:00</span>
                </div>
              </div>

              {/* Video Content */}
              <div className="flex-1 flex items-center justify-center relative mb-6">
                {isVideoCall ? (
                  <div className="relative w-full h-full max-h-96 rounded-2xl overflow-hidden bg-gray-800 shadow-xl border border-gray-700">
                    <video
                      autoPlay
                      className="w-full h-full object-cover"
                      playsInline
                      ref={(video) => video && (video.srcObject = remoteStream)}
                    />

                    {/* Self Video Preview */}
                    <div className="absolute bottom-4 right-4 w-32 h-44 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                      <video
                        autoPlay
                        muted
                        className="w-full h-full object-cover"
                        playsInline
                        ref={(video) =>
                          video &&
                          localStream &&
                          (video.srcObject = localStream)
                        }
                      />
                    </div>

                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white text-xs py-1 px-2 rounded-lg">
                      {isVideoEnabled ? "Active Video" : "Video Paused"}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        transition: { duration: 2, repeat: Infinity }
                      }}
                      className="w-28 h-28 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4"
                    >
                      {callAvatar ? (
                        <img
                          src={callAvatar}
                          alt={callName}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-bold text-white">
                          {callName?.charAt(0)}
                        </span>
                      )}
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {callName}
                    </h3>
                    <div className="flex items-center justify-center text-blue-300">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                      Audio Call in Progress
                    </div>

                    {isMuted && (
                      <div className="mt-3 text-red-400 text-sm flex items-center justify-center">
                        <FaMicrophoneSlash className="mr-1" />
                        Your microphone is muted
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Call Controls */}
              <div className="flex justify-center items-center gap-4">
                <motion.button
                  onClick={muteAudio}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isMuted
                      ? "bg-red-600 text-white"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </motion.button>

                {isVideoCall && (
                  <motion.button
                    onClick={toggleVideo}
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      !isVideoEnabled
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-white hover:bg-gray-600"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {!isVideoEnabled ? <FaVideoSlash /> : <FaVideo />}
                  </motion.button>
                )}

                <motion.button
                  onClick={onEndCall}
                  className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-600/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPhoneSlash className="text-xl" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call ended screen */}
        <AnimatePresence>
          {!isInCall && !isRinging && (
            <motion.div
              className="flex flex-col items-center justify-center h-full text-center p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <FaPhoneSlash className="text-red-500 text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Call Ended</h2>
              <p className="text-gray-400 mb-8">
                Your call has been disconnected
              </p>

              <motion.button
                onClick={handleDisconnectCall}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Return to Chat
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CallWindow;
