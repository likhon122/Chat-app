import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Search from "./Search";
import Notification from "./Notification";
import { useSelector } from "react-redux";
import { FiMenu, FiX } from "react-icons/fi";
import {
  FaHome,
  FaUser,
  FaSignInAlt,
  FaUserPlus,
  FaComment
} from "react-icons/fa";

const Navbar = () => {
  const userData = useSelector((state) => state.auth.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        closeMobileMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled, mobileMenuRef]);

  const handleNavLinkClick = () => {
    closeMobileMenu();
  };

  return (
    <nav
      className={`h-[8vh] ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md"
          : "bg-white dark:bg-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                C
              </div>
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                ChatApp
              </span>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1 px-16">
            {/* Search */}
            <div className="w-full max-w-lg">
              <Search />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {!userData ? (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    } flex items-center space-x-1`
                  }
                >
                  <FaHome className="text-lg" />
                  <span>Home</span>
                </NavLink>

                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    } flex items-center space-x-1`
                  }
                >
                  <FaSignInAlt className="text-lg" />
                  <span>Login</span>
                </NavLink>

                <NavLink
                  to="/sign-up"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all"
                      : "px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all opacity-90 hover:opacity-100"
                  }
                >
                  <div className="flex items-center space-x-1">
                    <FaUserPlus className="text-lg" />
                    <span>Sign Up</span>
                  </div>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/chat"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    } flex items-center space-x-1`
                  }
                >
                  <FaComment className="text-lg" />
                  <span>Chat</span>
                </NavLink>

                {/* Notification */}
                <div className="px-2">
                  <Notification />
                </div>

                {/* Profile */}
                <NavLink
                  to={`/profile/${userData._id}`}
                  className={({ isActive }) =>
                    `relative flex items-center ${
                      isActive
                        ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900"
                        : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 dark:hover:ring-offset-gray-900"
                    } rounded-full transition-all duration-300`
                  }
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden shadow-md border-2 border-white dark:border-gray-700">
                    <img
                      src={userData.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {userData && (
              <>
                <Notification />
                <NavLink
                  to={`/profile/${userData._id}`}
                  className="relative flex items-center mx-3"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-700">
                    <img
                      src={userData.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                </NavLink>
              </>
            )}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <FiX className="text-xl" />
              ) : (
                <FiMenu className="text-xl" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <Search />
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden fixed inset-0 top-16 bg-white dark:bg-gray-900 z-40 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto p-4">
          <div className="space-y-3 py-3">
            {!userData ? (
              <>
                <NavLink
                  to="/"
                  onClick={handleNavLinkClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  <FaHome className="text-xl" />
                  <span className="font-medium text-lg">Home</span>
                </NavLink>

                <NavLink
                  to="/login"
                  onClick={handleNavLinkClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  <FaSignInAlt className="text-xl" />
                  <span className="font-medium text-lg">Login</span>
                </NavLink>

                <NavLink
                  to="/sign-up"
                  onClick={handleNavLinkClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                        : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white opacity-90"
                    }`
                  }
                >
                  <FaUserPlus className="text-xl" />
                  <span className="font-medium text-lg">Sign Up</span>
                </NavLink>
              </>
            ) : (
              <>
                <div className="flex items-center p-4 border-b border-gray-100 dark:border-gray-800 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border-2 border-white dark:border-gray-700">
                    <img
                      src={userData.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {userData.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      @{userData.username || "username"}
                    </div>
                  </div>
                </div>

                <NavLink
                  to="/chat"
                  onClick={handleNavLinkClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  <FaComment className="text-xl" />
                  <span className="font-medium text-lg">Chat</span>
                </NavLink>

                <NavLink
                  to={`/profile/${userData._id}`}
                  onClick={handleNavLinkClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  <FaUser className="text-xl" />
                  <span className="font-medium text-lg">Profile</span>
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
