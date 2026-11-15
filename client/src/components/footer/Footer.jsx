import React, { memo } from "react";
import { Link } from "react-router-dom";
import {
  HiChatBubbleLeftRight,
  HiBolt,
  HiShieldCheck,
  HiVideoCamera,
  HiHeart,
} from "react-icons/hi2";
import {
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiMail,
  FiActivity,
} from "react-icons/fi";

// Memoized static navigation links for O(1) rendering efficiency
const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { name: "Real-Time Chat", href: "#features" },
      { name: "HD Video Calls", href: "#features" },
      { name: "Group Channels", href: "#features" },
      { name: "Web Push Alerts", href: "#features" },
      { name: "Support & Contact", href: "#contact" },
    ],
  },
  {
    title: "Architecture & DSA",
    links: [
      { name: "Socket.IO Engine", href: "#architecture" },
      { name: "WebRTC P2P Mesh", href: "#architecture" },
      { name: "O(1) Route Dispatch", href: "#architecture" },
      { name: "MongoDB Indexing", href: "#architecture" },
      { name: "Cloudinary CDN", href: "#features" },
    ],
  },
  {
    title: "Platform",
    links: [
      { name: "Login", href: "/login", isRoute: true },
      { name: "Sign Up", href: "/sign-up", isRoute: true },
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Security Architecture", href: "#architecture" },
    ],
  },
];

const TECH_BADGES = [
  "React 18",
  "Node.js",
  "Socket.IO",
  "WebRTC",
  "MongoDB",
  "Tailwind CSS",
  "Cloudinary",
  "Redux Toolkit",
];

const Footer = memo(() => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gray-900 dark:bg-[#0a0a0d] text-gray-300 border-t border-gray-800 dark:border-white/[0.08] overflow-hidden content-auto">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
                <HiChatBubbleLeftRight className="w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                ChatApp
              </span>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Ultra-fast, privacy-first real-time messaging and peer-to-peer HD
              video calling platform. Built with state-of-the-art event
              pipelines and sub-millisecond response architecture.
            </p>

            {/* Social links */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800/80 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="GitHub"
              >
                <FiGithub className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800/80 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <FiTwitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800/80 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <FiLinkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:support@chatapp.com"
                className="w-9 h-9 rounded-lg bg-gray-800/80 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Email"
              >
                <FiMail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {FOOTER_COLUMNS.map((col, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    {link.isRoute ? (
                      <Link
                        to={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tech Stack Badges */}
        <div className="pt-8 pb-6 border-t border-gray-800 dark:border-white/[0.08]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              High-Throughput Tech Stack:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {TECH_BADGES.map((badge, bIdx) => (
                <span
                  key={bIdx}
                  className="px-2.5 py-1 text-xs rounded-md bg-gray-800/60 text-gray-300 border border-gray-700/50"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-gray-800/60 dark:border-white/[0.05] flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-gray-500">
          <p>
            © {currentYear} ChatApp Inc. All rights reserved. Ultra-Performance
            Architecture.
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
