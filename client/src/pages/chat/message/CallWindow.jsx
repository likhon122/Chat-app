import React, { useEffect, useRef } from "react";

const CallWindow = ({ localStream, remoteStream, onEndCall, isVideoCall }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }

    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  return (
    <div className="call-window">
      <div className="videos">
        {/* Handle both video and audio calls */}
        {isVideoCall ? (
          <>
            <video ref={localVideoRef} autoPlay muted className="local-video" />
            <video ref={remoteVideoRef} autoPlay className="remote-video" />
          </>
        ) : (
          <audio ref={remoteVideoRef} autoPlay className="remote-audio" />
        )}
      </div>
      <button className="end-call-button" onClick={onEndCall}>
        End Call
      </button>
    </div>
  );
};

export default CallWindow;
