import React, { useEffect, useRef, useState } from "react";
import useClickOutside from "../../hooks/useClickOutsideHook";

const ProfileModal = ({ children, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeProfileViewRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);

    return () => {
      if (isClosing) {
        setIsVisible(false);
      }
    };
  }, [isClosing]);

  const handleClose = () => {
    if (!isClosing) {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        setIsClosing(false); // Reset closing state after animation
      }, 300); // Adjust this duration as needed
    }
  };

  useClickOutside(closeProfileViewRef, handleClose); // Use handleClose directly

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 dark:text-white ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        ref={closeProfileViewRef} // Make sure to assign the ref here
        className={`bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 shadow-lg transition-transform duration-300 ease-in-out transform ${
          isClosing ? "scale-95" : "scale-100"
        } w-[85%] sm:w-96 max-w-md`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 :h-6  sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="text-center ">
          <h2 className="sm:text-lg mb-[-10px] dark:text-white">
            Profile Details
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
