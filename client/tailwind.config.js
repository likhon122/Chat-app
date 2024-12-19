/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "media", // Use media strategy for dark mode
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        defaultBg: "#F5F7F8",
        defaultText: "#3A3B3C",
        darkBg: "#222222",
        darkText: "#FFFFFF",
        "scrollbar-thumb": "#6b7280",
        "scrollbar-track": "#1f2937"
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px"
      },
      animation: {
        "spin-reverse": "spin 1s linear infinite reverse",
        "spin-fast": "spin 0.5s linear infinite",
        "spin-medium": "spin 0.7s linear infinite"
      }
    }
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-thin": {
          "scrollbar-width": "thin"
        },
        ".scrollbar-thumb-rounded": {
          "scrollbar-color": "#6b7280 #1f2937"
        },
        ".scrollbar-thin::-webkit-scrollbar": {
          width: "8px"
        },
        ".scrollbar-thin::-webkit-scrollbar-thumb": {
          backgroundColor: "#6b7280",
          borderRadius: "10px"
        },
        ".scrollbar-thin::-webkit-scrollbar-track": {
          backgroundColor: "#1f2937"
        }
      });
    }
  ]
};
