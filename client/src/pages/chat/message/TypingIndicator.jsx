const TypingIndicator = ({ userTyping }) => {
  return (
    <div>
      {userTyping && (
        <div className="bg-transparent p-2 text-center text-sm text-gray-600  dark:text-gray-400 flex justify-center items-center shadow-md rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-4"
            viewBox="0 0 100 20"
            fill="none"
            stroke="none"
          >
            <circle cx="10" cy="10" r="8" fill="currentColor" className="dot" />
            <circle cx="30" cy="10" r="8" fill="currentColor" className="dot" />
            <circle cx="50" cy="10" r="8" fill="currentColor" className="dot" />
            <circle cx="70" cy="10" r="8" fill="currentColor" className="dot" />
            <circle cx="90" cy="10" r="8" fill="currentColor" className="dot" />
            <style>
              {`
          .dot {
            animation: bounce 1.5s infinite;
          }
          .dot:nth-child(1) { animation-delay: 0s; }
          .dot:nth-child(2) { animation-delay: 0.3s; }
          .dot:nth-child(3) { animation-delay: 0.6s; }
          .dot:nth-child(4) { animation-delay: 0.9s; }
          .dot:nth-child(5) { animation-delay: 1.2s; }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: scale(1);
            }
            40% {
              transform: scale(1.2);
            }
            60% {
              transform: scale(1.2);
            }
          }
        `}
            </style>
          </svg>
        </div>
      )}
    </div>
  );
};

export default TypingIndicator;
