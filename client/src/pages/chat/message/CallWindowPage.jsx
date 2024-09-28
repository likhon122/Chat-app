import { useParams, useLocation } from "react-router-dom";
import CallWindow from "../message/CallWindow";
import { useWebRTC } from "../../../hooks/useWebRTC";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../../../SocketHelper";
import { useEffect, useState } from "react";
import { useGetGroupDetailsQuery } from "../../../app/api/api";
import { toast } from "react-toastify";
import { setIncomingOffer } from "../../../app/features/otherSlice";

const CallWindowPage = () => {
  const { chatId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  const [offer, setOffer] = useState(null);

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

  // useEffect(() => {
  //   // Parse the query string from the URL
  //   const params = new URLSearchParams(location.search);

  //   // Extract and parse the offer from the URL
  //   const offerParam = params.get("offer");
  //   if (offerParam) {
  //     const parsedOffer = JSON.parse(decodeURIComponent(offerParam));

  //   }
  // }, [location]);

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
          {remoteStream && (
            <video
              autoPlay
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
              style={{ display: "none" }} // Hide the audio element
            />
          )}
        </div>
      )}
    </div>
  );
};
export default CallWindowPage;
