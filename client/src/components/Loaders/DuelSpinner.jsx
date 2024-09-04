import React from "react";

const DuelSpinner = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div className="absolute border-4 border-transparent  dark:border-t-white rounded-full animate-spin w-full h-full"></div>
        {/* Inner ring */}
        <div className="absolute border-4 border-transparent  dark:border-b-white dark:border-t-white rounded-full animate-spin-reverse w-3/4 h-3/4 top-[12.5%] left-[12.5%]"></div>
      </div>
    </div>
  );
};

export default DuelSpinner;
