import { FaPhoneAlt, FaVideo } from "react-icons/fa";
import { useCall } from "../../../context/CallContext";

const CallButtons = ({ chatId, member, isGroup = false, chatTitle = "" }) => {
  const { initiateCall } = useCall();

  const memberList = Array.isArray(member) ? member : [member];
  const targetIds = memberList.map((m) => m?._id || m).filter(Boolean);
  const target = memberList[0];

  const handleAudioCall = () => {
    if (!targetIds.length) return;
    initiateCall({
      chatId,
      callType: "audio",
      to: isGroup ? targetIds[0] : target?._id,
      toName: isGroup
        ? chatTitle || "Group Audio Call"
        : target?.name || "Friend",
      toImage: isGroup ? "" : target?.avatar || "",
      members: targetIds,
      isGroup,
      chatTitle
    });
  };

  const handleVideoCall = () => {
    if (!targetIds.length) return;
    initiateCall({
      chatId,
      callType: "video",
      to: isGroup ? targetIds[0] : target?._id,
      toName: isGroup
        ? chatTitle || "Group Video Call"
        : target?.name || "Friend",
      toImage: isGroup ? "" : target?.avatar || "",
      members: targetIds,
      isGroup,
      chatTitle
    });
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <button
        onClick={handleAudioCall}
        className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/20 transition shadow-sm active:scale-95"
        aria-label="Audio Call"
        title={isGroup ? "Start group audio call" : "Start audio call"}
      >
        <FaPhoneAlt className="text-xs" />
      </button>

      <button
        onClick={handleVideoCall}
        className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 transition shadow-sm active:scale-95"
        aria-label="Video Call"
        title={isGroup ? "Start group video call" : "Start video call"}
      >
        <FaVideo className="text-xs" />
      </button>
    </div>
  );
};

export default CallButtons;
