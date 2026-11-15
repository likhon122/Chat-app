import React, { useState, useRef, useEffect, memo, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiArrowRight } from "react-icons/fi";
import {
  HiChatBubbleLeftRight,
  HiHome,
  HiArrowRightOnRectangle,
  HiUserPlus,
  HiChatBubbleOvalLeftEllipsis,
  HiSparkles
} from "react-icons/hi2";
import Search from "./Search";
import Notification from "./Notification";

// Static guest navigation items
const GUEST_NAV_LINKS = [
  { id: "home", label: "Home", href: "/" },
  { id: "architecture", label: "Architecture", href: "#architecture" },
  { id: "testimonials", label: "Reviews", href: "#testimonials" },
  { id: "contact", label: "Contact", href: "#contact" }
];

const Navbar = memo(() => {
  const userData = useSelector((state) => state.auth.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const mobileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest("#mobile-menu-trigger")
      ) {
        closeMobileMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  // ScrollSpy to track active section smoothly on Home page
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }

    const sections = ["home", "features", "architecture", "testimonials", "contact"];

    let lastActive = "home";
    const handleScrollSpy = () => {
      const scrollY = window.scrollY;
      if (scrollY < 80) {
        if (lastActive !== "home") {
          lastActive = "home";
          setActiveSection("home");
        }
        return;
      }

      const scrollPosition = scrollY + 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          if (lastActive !== sections[i]) {
            lastActive = sections[i];
            setActiveSection(sections[i]);
          }
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    handleScrollSpy();

    return () => {
      window.removeEventListener("scroll", handleScrollSpy);
    };
  }, [location.pathname]);

  // Smooth sliding scroll on nav click with navbar offset compensation
  const handleNavClick = useCallback(
    (e, link) => {
      e.preventDefault();
      setActiveSection(link.id);
      closeMobileMenu();

      if (link.href === "/") {
        if (location.pathname !== "/") {
          navigate("/");
        } else {
          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });
        }
        return;
      }

      if (link.href.startsWith("#")) {
        const targetId = link.href.replace("#", "");

        if (location.pathname !== "/") {
          navigate("/" + link.href);
          return;
        }

        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          const headerOffset = 68;
          const elementPosition =
            targetEl.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }
    },
    [location.pathname, navigate]
  );

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#0c0d12] border-b border-gray-200/80 dark:border-white/[0.08] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <NavLink to="/" className="flex items-center space-x-2.5 group">
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <HiChatBubbleLeftRight className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0c0d12]"></span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-800 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  ChatApp
                </span>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-indigo-600 dark:text-indigo-400 -mt-1">
                  Ultra Fast
                </span>
              </div>
            </NavLink>
          </div>

          {/* Desktop Center Section */}
          {userData ? (
            <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-6">
              <div className="w-full">
                <Search />
              </div>
            </div>
          ) : (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium relative">
              {GUEST_NAV_LINKS.map((link) => {
                const isActive = activeSection === link.id && location.pathname === "/";
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link)}
                    className={`relative px-3.5 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400 font-bold"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <span>{link.label}</span>

                    {/* Animated Sliding Bottom Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-500 rounded-full shadow-sm shadow-indigo-500/50"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 32
                        }}
                      />
                    )}
                  </a>
                );
              })}
            </nav>
          )}

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {!userData ? (
              <>
                <NavLink
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-white transition-colors"
                >
                  Sign In
                </NavLink>

                <NavLink
                  to="/sign-up"
                  className="btn-grad relative inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden group uppercase tracking-wider"
                >
                  <span className="relative z-10 flex items-center space-x-1.5">
                    <span>Get Started</span>
                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/chat"
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all ${
                      isActive
                        ? "btn-grad text-white shadow-md shadow-cyan-500/20"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.08]"
                    }`
                  }
                >
                  <HiChatBubbleOvalLeftEllipsis className="w-4 h-4" />
                  <span>Chat</span>
                </NavLink>

                {/* Notifications */}
                <div className="flex items-center">
                  <Notification />
                </div>

                {/* Profile Pill */}
                <NavLink
                  to={`/profile/${userData._id}`}
                  className={({ isActive }) =>
                    `relative p-0.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[#0c0d12]"
                        : "hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600 ring-offset-2 dark:ring-offset-[#0c0d12]"
                    }`
                  }
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                    <img
                      src={userData.avatar}
                      alt={userData.name || "Profile"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0c0d12]" />
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Right Bar */}
          <div className="flex md:hidden items-center space-x-2">
            {userData && (
              <>
                <Notification />
                <NavLink
                  to={`/profile/${userData._id}`}
                  className="relative p-0.5 rounded-full mx-1"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img
                      src={userData.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0c0d12]" />
                </NavLink>
              </>
            )}

            <button
              id="mobile-menu-trigger"
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search for authenticated users */}
      {userData && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-gray-100 dark:border-white/[0.04]">
          <Search />
        </div>
      )}

      {/* Mobile Drawer (Framer Motion) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobileMenu}
              className="md:hidden fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Menu Panel */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="md:hidden fixed top-16 right-0 bottom-0 w-4/5 max-w-xs bg-white dark:bg-[#121319] border-l border-gray-200 dark:border-white/[0.08] shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-5 flex flex-col h-full justify-between">
                <div className="space-y-4">
                  {userData ? (
                    <>
                      <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.05]">
                        <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img
                            src={userData.avatar}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-gray-900 dark:text-white truncate">
                            {userData.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            @{userData.username || "username"}
                          </p>
                        </div>
                      </div>
                      {/* Mobile Search Box */}
                      <div className="pt-1">
                        <Search />
                      </div>
                    </>
                  ) : (
                    <div className="p-3 text-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        Welcome to ChatApp
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Ultra-fast communication platform
                      </p>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2">
                    {!userData ? (
                      <>
                        {GUEST_NAV_LINKS.map((link) => {
                          const isActive =
                            activeSection === link.id && location.pathname === "/";
                          return (
                            <a
                              key={link.id}
                              href={link.href}
                              onClick={(e) => handleNavClick(e, link)}
                              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                                isActive
                                  ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold border-l-4 border-indigo-600"
                                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                              }`}
                            >
                              <span>{link.label}</span>
                              {isActive && (
                                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                              )}
                            </a>
                          );
                        })}
                      </>
                    ) : (
                      <>
                        <NavLink
                          to="/chat"
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                            }`
                          }
                        >
                          <HiChatBubbleOvalLeftEllipsis className="w-5 h-5" />
                          <span>Chat Room</span>
                        </NavLink>

                        <NavLink
                          to={`/profile/${userData._id}`}
                          onClick={closeMobileMenu}
                          className={({ isActive }) =>
                            `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                            }`
                          }
                        >
                          <HiHome className="w-5 h-5" />
                          <span>My Profile</span>
                        </NavLink>
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile Bottom CTA */}
                {!userData && (
                  <div className="pt-6 border-t border-gray-100 dark:border-white/[0.06] space-y-2.5">
                    <NavLink
                      to="/login"
                      onClick={closeMobileMenu}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                    >
                      <HiArrowRightOnRectangle className="w-4 h-4" />
                      <span>Sign In</span>
                    </NavLink>

                    <NavLink
                      to="/sign-up"
                      onClick={closeMobileMenu}
                      className="btn-grad w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white uppercase tracking-wider"
                    >
                      <HiUserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                    </NavLink>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
