import { FaPhoneAlt, FaVideo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { callStarted } from "../../../app/features/otherSlice";
import { useDispatch, useSelector } from "react-redux";

const CallButtons = ({ chatId, member }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  // console.log(user);

  const handleAudioCall = () => {
    dispatch(callStarted(true));
    navigate(
      `/call/${chatId}?type=audio&&to=${member[0]._id}&&toName=${member[0].name}&&toImage=${member[0].avatar}`
    );
    ``;
  };

  const handleVideoCall = () => {
    dispatch(callStarted(true));
    navigate(
      `/call/${chatId}?type=video&&to=${member[0]._id}&&toName=${member[0].name}&&toImage=${member[0].avatar}`
    );
    // onVideoCall();
  };

  return (
    <div className="flex space-x-4 rounded-lg items-center justify-center ">
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
