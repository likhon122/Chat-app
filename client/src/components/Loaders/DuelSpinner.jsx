import React, { memo } from "react";
import { HiChatBubbleLeftRight } from "react-icons/hi2";

const DuelSpinner = memo(
  ({ text = "Connecting to real-time engine...", fullScreen = false }) => {
    return (
      <div
        className={`flex flex-col items-center justify-center ${
          fullScreen
            ? "h-screen w-screen bg-gray-50 dark:bg-[#0c0d12]"
            : "h-full w-full py-8"
        } select-none`}
      >
        <div className="relative flex items-center justify-center">
          {/* Circular spinner ring */}
          <div className="relative w-16 h-16">
            {/* Track */}
            <div className="w-full h-full rounded-full border-2 border-gray-200 dark:border-white/[0.08]" />

            {/* Active spinning gradient arc (GPU accelerated) */}
            <div className="absolute inset-0 w-full h-full rounded-full border-2 border-transparent border-t-indigo-600 dark:border-t-indigo-400 border-r-indigo-500/50 animate-spin" />
          </div>

          {/* Center brand badge */}
          <div className="absolute inset-0 m-auto w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
            <HiChatBubbleLeftRight className="w-4 h-4 animate-pulse" />
          </div>
        </div>
      </div>
    );
  },
);

DuelSpinner.displayName = "DuelSpinner";

export default DuelSpinner;
