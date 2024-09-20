import { useParams, useLocation } from "react-router-dom";
import CallWindow from "../message/CallWindow";
import { useWebRTC } from "../../../hooks/useWebRTC";
import { useSelector } from "react-redux";
import { getSocket } from "../../../SocketHelper";
import { useEffect } from "react";

const CallWindowPage =  () => {
  const { chatId } = useParams();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const callType = queryParams.get("type");

  const members = useSelector((state) => state.other.members);

  const callStarted = useSelector((state) => state.other.isCallStarted);

  const socket = getSocket();

  // Determine if the call is video or audio
  const isVideoCall = callType === "video" ? true : false;
  console.log("Is Video Call:", isVideoCall);

  const {
    localStream,
    remoteStream,
    startCall,
    handleAnswerCall,
    endCall,
    isRinging,
    isInCall
  } = useWebRTC(socket, chatId, members, isVideoCall);

  if (callStarted) {
   (async () => {
      await startCall();
    })();
  }

  const initiateCall = async () => {
    if (!isInCall && !isRinging) {
      await startCall(); // Initiate the call
    }
  };

  console.log("Local Stream Tracks:", localStream?.getTracks());
  console.log("Remote Stream Tracks:", remoteStream?.getTracks());

  useEffect(() => {
    let localAudioElement = null;

    if (localStream && remoteStream) {
      localAudioElement = document.createElement("audio");
      localAudioElement.srcObject = localStream;
      localAudioElement.muted = false; // Ensure audio is not muted
      localAudioElement.autoplay = true; // Automatically start playing
      localAudioElement.style.display = "none"; // Hide the audio element
      document.body.appendChild(localAudioElement); // Add it to the DOM

      // Play the audio (in case autoplay fails due to browser policy)
      localAudioElement.play().catch((err) => {
        console.error("Error playing local audio stream", err);
      });
    }

    return () => {
      // Cleanup on component unmount or localStream change
      if (localAudioElement) {
        localAudioElement.pause();
        localAudioElement.srcObject = null;
        document.body.removeChild(localAudioElement); // Remove from DOM
      }
    };
  }, [localStream, remoteStream]);

  return (
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
    </div>
  );
};

export default CallWindowPage;
