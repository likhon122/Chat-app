const NotFoundSVG = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      width="300"
      height="300"
    >
      <style>
        {`
          .bouncing {
            animation: bounce 1s infinite alternate;
          }
          .floating {
            animation: float 3s ease-in-out infinite;
          }
          .head-nod {
            animation: nod 2s infinite alternate;
          }
          .eye-blink {
            animation: blink 2s infinite;
          }
          @keyframes bounce {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(-15px);
            }
          }
          @keyframes float {
            0% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
            100% {
              transform: translateY(0);
            }
          }
          @keyframes nod {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(-10deg);
            }
          }
          @keyframes blink {
            0%, 100% {
              r: 10; /* Fully open */
            }
            50% {
              r: 5; /* Close for a blink */
            }
          }
          .robot-arm {
            animation: wave 1.5s infinite alternate;
          }
          @keyframes wave {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(15deg);
            }
          }
        `}
      </style>

      {/* Background Circles */}
      <circle cx="150" cy="150" r="60" fill="#FF6F61" className="floating" />
      <circle cx="350" cy="350" r="80" fill="#6FA3EF" className="floating" />
      <circle cx="400" cy="100" r="50" fill="#FFCE54" className="floating" />

      {/* Robot Body */}
      <rect x="180" y="200" width="140" height="150" rx="20" fill="#A3D9FF" />
      <rect
        x="200"
        y="350"
        width="30"
        height="50"
        fill="#FF6F61"
        className="robot-arm"
      />
      <rect
        x="320"
        y="350"
        width="30"
        height="50"
        fill="#FF6F61"
        className="robot-arm"
      />

      {/* Robot Head with Adjusted Position */}
      <rect
        x="200"
        y="120"
        width="100"
        height="50"
        rx="10"
        fill="#A3D9FF"
        className="head-nod"
      />

      {/* Robot Eyes with Blinking Effect */}
      <circle cx="225" cy="145" r="10" fill="#000" className="eye-blink" />
      <circle cx="275" cy="145" r="10" fill="#000" className="eye-blink" />

      {/* Robot Smile */}
      <path
        d="M230 175 Q250 195 270 175"
        stroke="#000"
        strokeWidth="5"
        fill="none"
      />

      {/* Animated 404 Text */}
      <text
        x="50%"
        y="400"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#FF6F61"
        fontSize="48"
        className="bouncing"
      >
        404
      </text>
    </svg>
  );
};

export default NotFoundSVG;
