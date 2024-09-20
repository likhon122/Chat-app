import React from "react";
import { FaPhoneAlt, FaVideo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { callStarted } from "../../../app/features/otherSlice";
import { useDispatch } from "react-redux";

const CallButtons = ({ chatId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleAudioCall = () => {
    dispatch(callStarted(true));
    navigate(`/call/${chatId}?type=audio`);
  };

  const handleVideoCall = () => {
    dispatch(callStarted(true));
    navigate(`/call/${chatId}?type=video`);
    // onVideoCall();
  };

  return (
    <div className="flex space-x-4 rounded-lg">
      <button
        onClick={handleAudioCall}
        className="flex items-center justify-center p-2 bg-blue-600 text-white font-semibold rounded-lg transition duration-300 ease-in-out transform hover:bg-blue-700 hover:scale-105"
        aria-label="Audio Call"
      >
        <FaPhoneAlt />
      </button>
      <button
        onClick={handleVideoCall}
        className="flex items-center justify-center p-2 bg-green-600 text-white font-semibold rounded-lg transition duration-300 ease-in-out transform hover:bg-green-700 hover:scale-105"
        aria-label="Video Call"
      >
        <FaVideo />
      </button>
    </div>
  );
};

export default CallButtons;
