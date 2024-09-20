import { useParams, useLocation } from "react-router-dom";
import CallWindow from "../message/CallWindow";
import { useWebRTC } from "../../../hooks/useWebRTC";
import { useSelector } from "react-redux";
import { getSocket } from "../../../SocketHelper";
import { useEffect } from "react";
import { useGetGroupDetailsQuery } from "../../../app/api/api";
import { toast } from "react-toastify";

const CallWindowPage = () => {
  const { chatId } = useParams();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const callType = queryParams.get("type");

  const { data, isLoading } = useGetGroupDetailsQuery(chatId, false);

  const members = [];
  if (data?.payload?.chat?.members.length > 1) {
    data.payload.chat.members.forEach((member) => members.push(member._id));
  }

  if (!isLoading && members.length < 1) {
    toast.error("No members found");
  }

  const callStarted = useSelector((state) => state.other.isCallStarted);
  const socket = getSocket();
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

  useEffect(() => {
    if (callStarted) {
      (async () => {
        await startCall();
      })();
    }
  }, [callStarted, startCall]);

  const initiateCall = async () => {
    if (!isInCall && !isRinging) {
      await startCall();
    }
  };

  useEffect(() => {
    console.log("Local Stream:", localStream);
    console.log("Remote Stream:", remoteStream);
  }, [localStream, remoteStream]);

  return isLoading ? (
    <div>Loading....</div>
  ) : (
    <div className="call-page">
      <CallWindow
        localStream={localStream}
        remoteStream={remoteStream}
        onEndCall={endCall}
        isVideoCall={isVideoCall}
        isRinging={isRinging}
        isInCall={isInCall}
        handleAnswerCall={handleAnswerCall}
        initiateCall={initiateCall}
      />
      {isVideoCall ? (
        <div className="video-container">
          {/* Video elements are here if needed for video calls */}
        </div>
      ) : (
        <div className="audio-container">
          {/* Audio elements for remote audio */}
          {remoteStream && (
            <audio
              autoPlay
              ref={(audio) => {
                if (audio) {
                  audio.srcObject = remoteStream;
                }
              }}
              style={{ display: "none" }} // Hide the audio element
            />
          )}
          {/* Local audio */}
          {localStream && (
            <audio
              autoPlay
              muted
              ref={(audio) => {
                if (audio) {
                  audio.srcObject = localStream;
                }
              }}
              style={{ display: "none" }} // Hide the audio element
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CallWindowPage;
