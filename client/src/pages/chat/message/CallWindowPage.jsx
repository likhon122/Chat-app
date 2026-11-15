import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import CallWindow from "./CallWindow";
import { useCall } from "../../../context/CallContext";

const CallWindowPage = () => {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    callStatus,
    localStream,
    remoteStream,
    remoteStreams,
    isCaller,
    isMuted,
    isVideoEnabled,
    activeCall,
    handleAnswerCall,
    endCall,
    muteAudio,
    toggleVideo,
    switchCamera,
    minimizeCall,
    resetCallState
  } = useCall();

  // Lock document body scroll while on call page
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const callType = queryParams.get("type") || activeCall?.callType || "audio";
  const to = queryParams.get("to") || queryParams.get("from") || activeCall?.to;
  const toName =
    queryParams.get("toName") ||
    queryParams.get("name") ||
    queryParams.get("fromName") ||
    activeCall?.toName;
  const toImage = queryParams.get("toImage") || activeCall?.toImage;
  const isGroup = Boolean(
    activeCall?.isGroup ||
      queryParams.get("isGroup") === "true" ||
      queryParams.get("chatTitle")
  );
  const chatTitle =
    queryParams.get("chatTitle") ||
    activeCall?.chatTitle ||
    (isGroup ? toName : "");

  const isVideoCall = callType === "video";

  const handleRejectCall = () => {
    endCall("rejected");
    navigate("/chat");
  };

  return (
    <div className="w-full h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] overflow-hidden bg-[#08090d] flex flex-col relative select-none">
      <CallWindow
        callStatus={callStatus}
        localStream={localStream}
        remoteStream={remoteStream}
        remoteStreams={remoteStreams}
        isGroup={isGroup}
        chatTitle={chatTitle}
        onEndCall={() => endCall()}
        isVideoCall={isVideoCall}
        isCaller={isCaller}
        handleAnswerCall={handleAnswerCall}
        handleRejectCall={handleRejectCall}
        resetCallState={resetCallState}
        muteAudio={muteAudio}
        toggleVideo={toggleVideo}
        switchCamera={switchCamera}
        isMuted={isMuted}
        isVideoEnabled={isVideoEnabled}
        toName={toName}
        toImage={toImage}
        to={to}
        onMinimize={minimizeCall}
      />
    </div>
  );
};

export default CallWindowPage;
