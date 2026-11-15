import React, { memo } from "react";

const SingleSpinner = memo(({
  size = "w-8 h-8",
  color = "border-t-indigo-600 dark:border-t-indigo-400",
  trackColor = "border-gray-200 dark:border-white/[0.08]",
  borderWidth = "border-2",
  speed = "animate-spin"
}) => {
  return (
    <div className="inline-flex items-center justify-center">
      <div className={`relative ${size}`}>
        {/* Track */}
        <div
          className={`w-full h-full rounded-full ${borderWidth} ${trackColor}`}
        />
        {/* Active Arc */}
        <div
          className={`absolute inset-0 w-full h-full rounded-full ${borderWidth} border-transparent ${color} ${speed}`}
        />
      </div>
    </div>
  );
});

SingleSpinner.displayName = "SingleSpinner";

export default SingleSpinner;
