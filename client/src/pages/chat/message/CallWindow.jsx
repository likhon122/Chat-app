import React from "react";

const CallWindow = ({
  localStream,
  remoteStream,
  onEndCall,
  isVideoCall,
  isRinging,
  isInCall,
  handleAnswerCall
}) => {
  return (
    <div className="call-window">
      {isRinging && !isInCall && (
        <div>
          <div>Incoming Call...</div>
          <button onClick={handleAnswerCall}>Answer Call</button>
        </div>
      )}
      {isInCall && (
        <>
          <div>
            {isVideoCall ? (
              <video
                autoPlay
                playsInline
                ref={(video) => video && (video.srcObject = remoteStream)}
              />
            ) : (
              <div>Audio Call</div>
            )}
          </div>
          <button onClick={onEndCall}>End Call</button>
        </>
      )}
      {!isInCall && !isRinging && (
        <button onClick={handleAnswerCall}>Answer Call</button>
      )}
    </div>
  );
};

export default CallWindow;
