import React from "react";

const SingleSpinner = ({
  size = "w-20 h-20",
  color = "border-t-black border-l-black",
  darkColor = "dark:border-t-gray-200 dark:border-l-gray-200",
  borderWidth = "border-t-2 border-l-2",
  speed = "animate-spin-fast" 
}) => {
  return (
    <div className="flex items-center justify-center">
      <div className={`relative ${size}`}>
        <div
          className={`absolute ${borderWidth}  border-transparent ${color}  ${darkColor} rounded-full ${speed} w-full h-full`}
        ></div>
      </div>
    </div>
  );
};

export default SingleSpinner;
