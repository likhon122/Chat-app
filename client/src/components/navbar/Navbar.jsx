import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Search from "./Search";
import Notification from "./Notification";
import { useSelector } from "react-redux";
import { FiMoreHorizontal } from "react-icons/fi";

const Navbar = () => {
  const userData = useSelector((state) => state.auth.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        closeMobileMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuRef]);

  const handleNavLinkClick = () => {
    closeMobileMenu();
  };

  return (
    <div className="dark:shadow-md bg-[#FFFFFF] dark:bg-[#222222] h-[6vh] md:h-[5vh] w-full z-[] dark:shadow-black border-b dark:border-none border-b-gray-300">
      <div className="container mx-auto flex items-center justify-between sm:px-4 sm:py-2 gap-1 sm:gap-2 h-full ">
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-700 dark:text-white pl-1 py-2 rounded focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <FiMoreHorizontal className="text-xl" />
          </button>
        </div>
        <ul className="md:flex items-center gap-8 hidden">
          {!userData && (
            <>
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `text-lg font-medium transition-colors ${
                      isActive
                        ? "text-[#7D8ABC] dark:text-[#7D8ABC]"
                        : "text-gray-700 dark:text-white"
                    } hover:text-gray-900 dark:hover:text-gray-300`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `text-lg font-medium transition-colors ${
                      isActive
                        ? "text-[#7D8ABC] dark:text-[#7D8ABC]"
                        : "text-gray-700 dark:text-white"
                    } hover:text-gray-900 dark:hover:text-gray-300`
                  }
                >
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/sign-up"
                  className={({ isActive }) =>
                    `text-lg font-medium transition-colors ${
                      isActive
                        ? "text-[#7D8ABC] dark:text-[#7D8ABC]"
                        : "text-gray-700 dark:text-white"
                    } hover:text-gray-900 dark:hover:text-gray-300`
                  }
                >
                  Sign Up
                </NavLink>
              </li>
            </>
          )}
        </ul>
        {userData && (
          <ul className="md:flex items-center gap-8 hidden">
            <li>
              <NavLink
                to="/chat/"
                className={({ isActive }) =>
                  `text-lg font-medium transition-colors ${
                    isActive
                      ? "text-[#7D8ABC] dark:text-[#7D8ABC]"
                      : "text-gray-700 dark:text-white"
                  } hover:text-gray-900 dark:hover:text-gray-300`
                }
              >
                Chat
              </NavLink>
            </li>
          </ul>
        )}

        <div className="flex-grow flex justify-center ">
          <Search />
        </div>

        {userData && <Notification />}
        <div
          className="flex items-center sm:gap-2 z-50 mr-2 "
          title="Notification"
        >
          {userData?._id && (
            <NavLink
              to={`/profile/${userData._id}`}
              onClick={handleNavLinkClick}
              className="relative flex items-center transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-1"
            >
              <img
                src={userData.avatar}
                alt="User Avatar"
                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </NavLink>
          )}
        </div>
      </div>

      <div
        ref={mobileMenuRef}
        className={`${
          isMobileMenuOpen
            ? "block opacity-100 scale-100"
            : "hidden opacity-0 scale-95"
        } transition-all duration-300 ease-in-out bg-white dark:bg-[#222222] md:hidden border-t border-gray-200 dark:border-gray-700 z-40 fixed top-[6vh] left-0 w-full`}
      >
        <ul className="flex flex-col gap-4 p-4">
          {!userData && (
            <>
              <li>
                <NavLink
                  to="/"
                  onClick={handleNavLinkClick}
                  className={({ isActive }) =>
                    `text-lg font-medium transition-colors ${
                      isActive
                        ? "text-[#7D8ABC] dark:text-[#7D8ABC]"
                        : "text-gray-700 dark:text-white"
                    } hover:text-gray-900 dark:hover:text-gray-300`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/login"
                  onClick={handleNavLinkClick}
                  className={({ isActive }) =>
                    `text-lg font-medium transition-colors ${
                      isActive
                        ? "text-[#7D8ABC] dark:text-[#7D8ABC]"
                        : "text-gray-700 dark:text-white"
                    } hover:text-gray-900 dark:hover:text-gray-300`
                  }
                >
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/sign-up"
                  onClick={handleNavLinkClick}
                  className={({ isActive }) =>
                    `text-lg font-medium transition-colors ${
                      isActive
                        ? "text-[#7D8ABC] dark:text-[#7D8ABC]"
                        : "text-gray-700 dark:text-white"
                    } hover:text-gray-900 dark:hover:text-gray-300`
                  }
                >
                  Sign Up
                </NavLink>
              </li>
            </>
          )}
          {userData && (
            <li>
              <NavLink
                to="/chat"
                onClick={handleNavLinkClick}
                className={({ isActive }) =>
                  `text-lg font-medium transition-colors ${
                    isActive
                      ? "text-[#7D8ABC] dark:text-[#7D8ABC]"
                      : "text-gray-700 dark:text-white"
                  } hover:text-gray-900 dark:hover:text-gray-300`
                }
              >
                Chat
              </NavLink>
            </li>
          )}
          {userData?._id && (
            <li>
              <NavLink
                to={`/profile/${userData._id}`}
                onClick={handleNavLinkClick}
                className={({ isActive }) =>
                  `md:text-lg font-medium transition-colors ${
                    isActive
                      ? "text-[#7D8ABC] dark:text-[#7D8ABC]"
                      : "text-gray-700 dark:text-white"
                  } hover:text-gray-900 dark:hover:text-gray-300`
                }
              >
                Profile
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;

// import React, { useState, useRef, useEffect } from "react";
// import { FaBars } from "react-icons/fa"; // assuming you are using React Icons
// import { Link } from "react-router-dom";

// const Navbar = () => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const mobileMenuRef = useRef();

//   const handleToggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };

//   // Close the mobile menu if clicked outside of it
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         mobileMenuRef.current &&
//         !mobileMenuRef.current.contains(event.target)
//       ) {
//         setIsMobileMenuOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [mobileMenuRef]);

//   return (
//     <div className="dark:shadow-md bg-[#FFFFFF] dark:bg-[#222222] h-[6vh] md:h-[5vh] w-full z-50 dark:shadow-black border-b dark:border-none border-b-gray-300 fixed top-0 left-0">
//       {/* Navbar Content */}
//       <div className="container mx-auto flex items-center justify-between sm:px-4 sm:py-2 gap-1 sm:gap-2 h-full">
//         {/* Logo */}
//         <Link to="/" className="text-xl font-bold dark:text-white">
//           ChatApp
//         </Link>

//         {/* Links for desktop */}
//         <div className="hidden md:flex gap-4 items-center">
//           <Link to="/profile" className="text-gray-800 dark:text-gray-200">
//             Profile
//           </Link>
//           <Link to="/settings" className="text-gray-800 dark:text-gray-200">
//             Settings
//           </Link>
//           {/* Add more links here if necessary */}
//         </div>

//         {/* Hamburger icon for mobile */}
//         <div className="md:hidden flex items-center">
//           <button
//             onClick={handleToggleMobileMenu}
//             className="text-gray-800 dark:text-gray-200"
//           >
//             <FaBars size={24} />
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       <div
//         ref={mobileMenuRef}
//         className={`${
//           isMobileMenuOpen
//             ? "block opacity-100 scale-100"
//             : "hidden opacity-0 scale-95"
//         } transition-all duration-300 ease-in-out bg-white dark:bg-[#222222] md:hidden border-t border-gray-200 dark:border-gray-700 z-40 fixed top-[6vh] left-0 w-full`}
//       >
//         <ul className="flex flex-col gap-4 p-4">
//           <li>
//             <Link
//               to="/profile"
//               className="text-gray-800 dark:text-gray-200"
//               onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
//             >
//               Profile
//             </Link>
//           </li>
//           <li>
//             <Link
//               to="/settings"
//               className="text-gray-800 dark:text-gray-200"
//               onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
//             >
//               Settings
//             </Link>
//           </li>
//           {/* Add more mobile menu links here if necessary */}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default Navbar;
