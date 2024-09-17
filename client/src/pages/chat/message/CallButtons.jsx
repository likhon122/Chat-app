import React from "react";

const CallButtons = ({ onAudioCall, onVideoCall }) => {
  return (
    <div className="call-buttons">
      <button onClick={onAudioCall} className="audio-call-button bg-gray-600">
        Audio Call
      </button>
      <button onClick={onVideoCall} className="video-call-button">
        Video Call
      </button>
    </div>
  );
};

export default CallButtons;
