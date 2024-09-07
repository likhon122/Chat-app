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
    <div className="shadow-lg bg-[#FFFFFF] dark:bg-[#1F2937] top-0 left-0 w-full z-10">
      <div className="container mx-auto flex items-center justify-between py-2 px-2 sm:px-4 sm:py-2 gap-1 sm:gap-2 ">
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-700 dark:text-white p-2 rounded focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <FiMoreHorizontal size={24} />
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
          {userData && (
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
          )}
        </ul>

        <div className="flex-grow flex justify-center">
          <Search />
        </div>

        <div className="flex items-center sm:gap-2 gap-1 z-50" title="Profile">
          {userData && <Notification />}
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
          isMobileMenuOpen ? "max-h-screen" : "max-h-0"
        } overflow-hidden transition-max-height duration-300 ease-in-out bg-white dark:bg-[#222222] md:hidden border-t border-gray-200 dark:border-gray-700`}
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
                to="/chat/"
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
