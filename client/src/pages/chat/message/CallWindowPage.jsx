import { useParams, useLocation, useNavigate } from "react-router-dom";
import CallWindow from "../message/CallWindow";
import { useWebRTC } from "../../../hooks/useWebRTC";
import { useDispatch, useSelector } from "react-redux";
import { useGetSocket } from "../../../SocketHelper";
import { useEffect } from "react";
import { useGetGroupDetailsQuery } from "../../../app/api/api";
import { toast } from "react-toastify";

const CallWindowPage = () => {
  const { chatId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (callStarted) {
      (async () => {
        await startCall();
      })();
    }
  }, [callStarted, startCall]);

  const handleRejectCall = () => {
    endCall();
    navigate("/chat");
  };

  return isLoading ? (
    <div className="text-center text-white bg-gray-900">Loading....</div>
  ) : (
    <div className="call-page bg-gray-900 text-white h-[94vh] flex justify-center items-center">
      <CallWindow
        localStream={localStream}
        remoteStream={remoteStream}
        onEndCall={endCall}
        isVideoCall={isVideoCall}
        isRinging={isRinging}
        isInCall={isInCall}
        handleAnswerCall={handleAnswerCall}
        initiateCall={startCall}
        toName={toName}
        toImage={toImage}
        to={to}
        handleRejectCall={handleRejectCall}
      />
      {isVideoCall ? (
        <div className="video-container p-4">
          {remoteStream && (
            <video
              autoPlay
              className="rounded-lg shadow-lg border border-gray-800"
              ref={(video) => {
                if (video) {
                  video.srcObject = remoteStream;
                }
              }}
            />
          )}
        </div>
      ) : (
        <div className="audio-container">
          {remoteStream && (
            <audio
              autoPlay
              ref={(audio) => {
                if (audio) {
                  audio.srcObject = remoteStream;
                }
              }}
              style={{ display: "none" }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CallWindowPage;
