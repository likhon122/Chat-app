import { FaPhoneAlt, FaVideo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { callStarted } from "../../../app/features/otherSlice";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";

const CallButtons = ({ chatId, member }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleAudioCall = () => {
    dispatch(callStarted(true));
    navigate(
      `/call/${chatId}?type=audio&&to=${member[0]._id}&&toName=${member[0].name}&&toImage=${member[0].avatar}`
    );
  };

  const handleVideoCall = () => {
    dispatch(callStarted(true));
    navigate(
      `/call/${chatId}?type=video&&to=${member[0]._id}&&toName=${member[0].name}&&toImage=${member[0].avatar}`
    );
  };

  return (
    <div className="flex space-x-3">
      <motion.button
        onClick={handleAudioCall}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Audio Call"
        title="Start audio call"
      >
        <FaPhoneAlt className="text-sm" />
      </motion.button>
      <motion.button
        onClick={handleVideoCall}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Video Call"
        title="Start video call"
      >
        <FaVideo className="text-sm" />
      </motion.button>
    </div>
  );
};

export default CallButtons;
