import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="call-window text-white w-full h-screen flex flex-col justify-between relative overflow-hidden">
      {toImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${toImage})`,
            filter: "blur(10px)",
            zIndex: 1
          }}
        />
      )}
      {callerAvatar && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${callerAvatar})`,
            filter: "blur(10px)",
            zIndex: 1
          }}
        />
      )}
      <div className="relative z-10 flex-grow flex flex-col justify-between p-8">
        {isRinging && !isInCall && (
          <div className="flex flex-col items-center justify-center h-[80%]">
            <div className="text-lg font-semibold mb-4 animate-bounce">
              Incoming Call...
            </div>
            {callerAvatar ? (
              <img
                src={callerAvatar}
                alt={`${callerDetails.callerInfo.fromName}'s avatar`}
                className="w-28 h-28 rounded-full mb-4 object-cover border-4 border-green-500 shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 rounded-full mb-4 bg-gray-600 flex items-center justify-center text-4xl shadow-lg">
                {callerDetails?.callerInfo?.fromName?.charAt(0)}
              </div>
            )}
            <div className="text-3xl font-semibold mb-4">
              {callerDetails?.callerInfo?.fromName}
            </div>
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={handleAnswerCall}
                className="px-6 py-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105"
              >
                Answer Call
              </button>
              <button
                onClick={handleRejectCall}
                className="px-6 py-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-transform transform hover:scale-105"
              >
                Reject Call
              </button>
            </div>
          </div>
        )}
        {isInCall && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                {callerAvatar || toImage ? (
                  <img
                    src={callerAvatar ? callerAvatar : toImage}
                    alt={`${callerDetails?.callerInfo?.fromName}'s avatar`}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-700 shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-600 flex items-center justify-center text-lg shadow-md">
                    {callerDetails?.callerInfo?.fromName
                      ? callerDetails?.callerInfo?.fromName.charAt(0)
                      : toName.charAt(0)}
                  </div>
                )}
                <div className="ml-4">
                  <div className="text-2xl font-semibold">
                    {callerDetails?.callerInfo?.fromName
                      ? callerDetails?.callerInfo?.fromName
                      : toName}
                  </div>
                  <div className="text-sm text-green-500">In Call</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center mb-6 relative">
              {isVideoCall ? (
                <video
                  autoPlay
                  className="rounded-lg shadow-xl border border-gray-700 w-full h-64 object-cover"
                  playsInline
                  ref={(video) => video && (video.srcObject = remoteStream)}
                />
              ) : (
                <div className="flex flex-col items-center">
                  <img
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-700 shadow-md "
                    src={
                      "https://img.freepik.com/premium-vector/vector-headphones-flat-style_995281-15703.jpg?w=740"
                    }
                    alt=""
                  />

                  <div className="text-lg mt-4">Audio Call</div>
                </div>
              )}
            </div>

            <div className="flex justify-center items-center gap-6 mt-6">
              <button
                onClick={muteAudio}
                className={`h-10 w-[100px] rounded-full shadow-md text-white text-sm transition-transform duration-300 ${
                  isMuted
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-700 hover:bg-gray-600"
                } transform hover:scale-105`}
              >
                {isMuted ? "Unmute" : "Mute"}
              </button>
              {isVideoCall && (
                <button
                  onClick={toggleVideo}
                  className={`h-10 w-[100px] rounded-full shadow-md text-white text-sm transition-transform duration-300 ${
                    isVideoEnabled
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-700 hover:bg-gray-600"
                  } transform hover:scale-105`}
                >
                  {isVideoEnabled ? "Disable Video" : "Enable Video"}
                </button>
              )}
              <button
                onClick={onEndCall}
                className="h-10 w-[100px] bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-transform duration-300 transform hover:scale-105"
              >
                End Call
              </button>
            </div>
          </>
        )}
        {!isInCall && !isRinging && (
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-6">Call Disconnected</h1>
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform duration-300 transform hover:scale-105"
              onClick={handleDisconnectCall}
            >
              Back to chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallWindow;
