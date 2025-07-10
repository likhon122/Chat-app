import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CallWindow from "../message/CallWindow";
import { useWebRTC } from "../../../hooks/useWebRTC";
import { useSelector } from "react-redux";
import { useGetSocket } from "../../../SocketHelper";
import { useEffect, useState } from "react";
import { useGetGroupDetailsQuery } from "../../../app/api/api";
import { toast } from "react-toastify";

const CallWindowPage = () => {
  const { chatId } = useParams();
  const location = useLocation();
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const callType = queryParams.get("type");
  const to = queryParams.get("to");
  const toName = queryParams.get("toName");
  const toImage = queryParams.get("toImage");

  const { data, isLoading } = useGetGroupDetailsQuery(chatId, false);

  const members =
    data?.payload?.chat?.members.map((member) => member._id) || [];

  if (!isLoading && members.length < 1) {
    toast.error("No members found");
  }

  const callStarted = useSelector((state) => state.other.isCallStarted);
  const socket = useGetSocket();
  const isVideoCall = callType === "video";

  const {
    localStream,
    remoteStream,
    startCall,
    handleAnswerCall,
    endCall,
    isRinging,
    isInCall
  } = useWebRTC(socket, chatId, members, isVideoCall);

  const handleMuteAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const enabled = !audioTracks[0].enabled;
        audioTracks[0].enabled = enabled;
        setMuted(!enabled);
      }
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const enabled = !videoTracks[0].enabled;
        videoTracks[0].enabled = enabled;
        setVideoEnabled(enabled);
      }
    }
  };

  useEffect(() => {
    if (callStarted) {
      (async () => {
        await startCall();
      })();
    }

    // Set up call timer
    let callTimer;
    let seconds = 0;
    let minutes = 0;

    if (isInCall) {
      callTimer = setInterval(() => {
        seconds++;
        if (seconds === 60) {
          minutes++;
          seconds = 0;
        }

        const timerElement = document.getElementById("call-timer");
        if (timerElement) {
          timerElement.textContent = `${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }
      }, 1000);
    }

    return () => {
      if (callTimer) clearInterval(callTimer);
    };
  }, [callStarted, startCall, isInCall]);

  const handleRejectCall = () => {
    endCall();
    navigate("/chat");
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white">Connecting call...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="h-screen bg-gray-900 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <CallWindow
        localStream={localStream}
        remoteStream={remoteStream}
        onEndCall={endCall}
        isVideoCall={isVideoCall}
        isRinging={isRinging}
        isInCall={isInCall}
        handleAnswerCall={handleAnswerCall}
        handleRejectCall={handleRejectCall}
        muteAudio={handleMuteAudio}
        toggleVideo={handleToggleVideo}
        isMuted={muted}
        isVideoEnabled={videoEnabled}
        toName={toName}
        toImage={toImage}
        to={to}
      />
    </motion.div>
  );
};

export default CallWindowPage;
