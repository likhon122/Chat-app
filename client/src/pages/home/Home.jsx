import React, { useState, useEffect, useCallback, memo } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "../../utils/alert";
import {
  HiSparkles,
  HiChatBubbleLeftRight,
  HiVideoCamera,
  HiShieldCheck,
  HiBolt,
  HiArrowRight,
  HiPaperAirplane,
  HiUsers,
  HiCheckCircle,
  HiChevronDown,
  HiDevicePhoneMobile,
  HiLockClosed,
  HiPhoneArrowUpRight,
} from "react-icons/hi2";
import { FiStar, FiActivity, FiCpu, FiServer, FiSend } from "react-icons/fi";
import { useSendSupportMessageMutation } from "../../app/api/api";

// ==========================================
// DSA-FRIENDLY STATIC DATA STRUCTURES (O(1) ACCESS)
// Pre-allocated in memory to eliminate render allocations
// ==========================================

const STATS_DATA = [
  {
    value: "< 30ms",
    label: "P99 Dispatch Latency",
    desc: "Direct duplex Socket.IO binary stream with zero polling overhead",
    icon: HiBolt,
  },
  {
    value: "O(1)",
    label: "Hash-Map Route Lookup",
    desc: "In-memory socket mapping provides constant-time user targeting",
    icon: FiCpu,
  },
  {
    value: "0 Server Lag",
    label: "P2P WebRTC HD Calling",
    desc: "Direct peer-to-peer audio/video streaming via native browser ICE mesh",
    icon: HiVideoCamera,
  },
  {
    value: "99.99%",
    label: "Resilient Uptime",
    desc: "Automatic session re-negotiation & optimistic UI updates",
    icon: FiActivity,
  },
];

const BENTO_FEATURES = [
  {
    id: "messaging",
    title: "Sub-Millisecond Real-Time Messaging",
    subtitle: "Duplex WebSocket Pipeline",
    description:
      "Powered by Socket.IO with optimistic client reconciliation. Experience typing indicators, instant delivery receipts, and live read status with zero round-trip delay.",
    icon: HiChatBubbleLeftRight,
    span: "lg:col-span-2",
    tag: "High Throughput",
  },
  {
    id: "webrtc",
    title: "WebRTC 1-on-1 HD Video & Voice",
    subtitle: "Peer-to-Peer Media Mesh",
    description:
      "Crystal-clear encrypted video calling directly between browsers. Eliminates server transcoding bottlenecks and guarantees maximum privacy.",
    icon: HiVideoCamera,
    span: "lg:col-span-1",
    tag: "Sub-50ms AV",
  },
  {
    id: "groups",
    title: "Dynamic Multi-Member Channels",
    subtitle: "Role-Based Broadcast",
    description:
      "Create rich community groups, assign administrators, add/remove members on the fly, and broadcast messages to entire teams with O(1) room fanout.",
    icon: HiUsers,
    span: "lg:col-span-1",
    tag: "Scalable Rooms",
  },
  {
    id: "media",
    title: "Cloudinary CDN File & Media Engine",
    subtitle: "Base64 Stream Pipeline",
    description:
      "Upload high-resolution photos, documents, and voice clips. Automatically compressed, optimized, and delivered via ultra-fast global CDN edges.",
    icon: HiDevicePhoneMobile,
    span: "lg:col-span-2",
    tag: "Instant Previews",
  },
  {
    id: "push",
    title: "Web Push Notifications (VAPID)",
    subtitle: "Always-On Alerting",
    description:
      "Never miss a critical ping. Native service worker push notifications reach your desktop or mobile browser even when the application tab is completely closed.",
    icon: HiBolt,
    span: "lg:col-span-2",
    tag: "Background Sync",
  },
  {
    id: "security",
    title: "Hardened Cryptographic Security",
    subtitle: "JWT & HttpOnly Cookies",
    description:
      "Defend against XSS and CSRF attacks with strict SameSite cookies, bcrypt credential hashing, and automatic invalid signature self-healing.",
    icon: HiShieldCheck,
    span: "lg:col-span-1",
    tag: "Enterprise Grade",
  },
];

const ARCHITECTURE_STEPS = [
  {
    step: "01",
    title: "Cryptographic Handshake",
    desc: "Client authenticates through JWT signed cookies with automatic signature validation and token rejuvenation.",
    icon: HiLockClosed,
  },
  {
    step: "02",
    title: "O(1) Socket Map Registration",
    desc: "Active sockets are indexed in a high-speed memory Map (userSocketIds) for immediate constant-time event routing.",
    icon: FiServer,
  },
  {
    step: "03",
    title: "Direct P2P or Event Fanout",
    desc: "Voice & video establish direct WebRTC peer connections; messages stream via lightweight binary WebSocket payloads.",
    icon: HiBolt,
  },
  {
    step: "04",
    title: "Compound B-Tree Persistence",
    desc: "MongoDB Atlas indexes ensure O(log N) fast message retrieval and effortless infinite scroll pagination.",
    icon: FiCpu,
  },
];

const TESTIMONIALS_DATA = [
  {
    quote:
      "The message delivery speed is astonishing. You hit send and the recipient receives it literally without perceivable delay. The WebRTC video calling is remarkably crisp.",
    name: "Alex Rivera",
    role: "Senior Distributed Systems Engineer",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    quote:
      "Most chat apps feel bloated, but ChatApp's ultra-clean dark UI and instant group sync make it our team's daily driver for dev communications.",
    name: "Samantha Wright",
    role: "Lead Full-Stack Developer",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    quote:
      "Native web push notifications keep me updated without having to keep the tab focused. The UI polish and responsive layout on mobile are top notch.",
    name: "David Kim",
    role: "Product Designer & Community Host",
    avatar:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80",
    rating: 5,
  },
];

const FAQ_ITEMS = [
  {
    question: "How does ChatApp achieve sub-millisecond message speeds?",
    answer:
      "ChatApp uses a persistent, bidirectional WebSocket connection powered by Socket.IO. Instead of making recurring HTTP requests (polling), the server maintains an active TCP stream and dispatches events in O(1) constant time directly to the recipient's socket ID.",
  },
  {
    question: "Are WebRTC video & voice calls routed through your servers?",
    answer:
      "No. Signaling (initiating, answering, and ICE candidate exchange) is coordinated through our server, but once negotiated, the audio and video stream directly peer-to-peer (P2P) between the two devices. Your media never passes through or gets recorded on our servers.",
  },
  {
    question: "How does the app handle background notifications?",
    answer:
      "We utilize the standard Web Push API and VAPID public/private key cryptography. When your browser is asleep or the tab is closed, the push service wakes a lightweight Service Worker to display real-time message and call alerts.",
  },
  {
    question: "Can I share high-resolution images and attachments?",
    answer:
      "Yes! Attachments are processed, optimized, and served through Cloudinary's multi-region CDN, ensuring fast uploads and compressed responsive downloads on any bandwidth.",
  },
  {
    question: "What security measures are in place?",
    answer:
      "All credentials are protected with bcrypt salting, and sessions use HttpOnly, SameSite cookies. Furthermore, token signatures are automatically validated on every request to eliminate hijacking and invalid signatures.",
  },
];

// ==========================================
// ULTRA-FAST LIGHTWEIGHT CHAT SIMULATOR (ZERO LAG)
// ==========================================
const InteractiveChatSimulator = memo(() => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Sarah Lin",
      text: "Hey! Did you check out the new WebRTC calling feature? 🚀",
      isMe: false,
      time: "12:42 PM",
    },
    {
      id: 2,
      sender: "You",
      text: "Yes! Latency is practically zero, audio is crystal clear. 🎧",
      isMe: true,
      time: "12:43 PM",
    },
    {
      id: 3,
      sender: "Sarah Lin",
      text: "Let's test group screen sharing next!",
      isMe: false,
      time: "12:43 PM",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [reactionFeedback, setReactionFeedback] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = useCallback(
    (e) => {
      e?.preventDefault();
      if (!inputText.trim()) return;

      const userMsg = {
        id: Date.now(),
        sender: "You",
        text: inputText,
        isMe: true,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText("");

      // Simulated instant response
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const botResponses = [
          "Awesome! Everything is synced in O(1) time! ⚡",
          "WebRTC ICE candidates connected smoothly! 🟢",
          "Push notifications dispatched to your devices! 🔔",
          "Rock solid encryption active! 🛡️",
        ];
        const randomResp =
          botResponses[Math.floor(Math.random() * botResponses.length)];
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "Sarah Lin",
            text: randomResp,
            isMe: false,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }, 700);
    },
    [inputText],
  );

  const handleQuickReaction = useCallback((emoji) => {
    setReactionFeedback(`Sent ${emoji}`);
    setTimeout(() => setReactionFeedback(""), 1200);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto bg-white dark:bg-[#12131a] rounded-3xl border border-gray-200 dark:border-white/[0.08] shadow-xl p-4 sm:p-5 overflow-hidden gpu-accelerated">
      {/* Top Header of Mock Chat */}
      <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-white/[0.08]">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500/40">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Sarah"
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#12131a]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Sarah Lin
              </h4>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Active Now • Sub-25ms
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleQuickReaction("📞")}
            className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
            title="Start P2P Voice Call"
          >
            <HiPhoneArrowUpRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleQuickReaction("🎥")}
            className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
            title="Start P2P HD Video Call"
          >
            <HiVideoCamera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WebRTC Live Call Badge Simulator */}
      <div className="my-2.5 py-1 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-gray-700 dark:text-gray-300">
        <span className="flex items-center space-x-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            WebRTC HD Stream:
          </span>
          <span>4K 60fps • 0 Dropped Packets</span>
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
          16.4 Mbps
        </span>
      </div>

      {/* Messages Feed */}
      <div className="space-y-2.5 py-2 max-h-56 min-h-[14rem] overflow-y-auto custom-scrollbar pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                msg.isMe
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                  : "bg-gray-100 dark:bg-white/[0.08] text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200/50 dark:border-white/[0.05]"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1">
              {msg.time}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] w-fit text-[11px] text-gray-500 dark:text-gray-400">
            <span>Sarah is typing</span>
            <span className="inline-flex space-x-0.5">
              <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </span>
          </div>
        )}
      </div>

      {/* Quick Interactive Reaction Bar */}
      <div className="flex items-center justify-between pt-2 pb-1 border-t border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            Quick Reactions:
          </span>
          {reactionFeedback && (
            <span className="text-[10px] font-semibold text-emerald-500">
              {reactionFeedback}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1.5">
          {["🔥", "❤️", "🚀", "⚡", "🎉"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleQuickReaction(emoji)}
              type="button"
              className="p-1 text-sm hover:scale-125 active:scale-95 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="relative flex items-center mt-1"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type an instant message..."
          className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
        <button
          type="submit"
          className="btn-grad absolute right-1.5 p-2 rounded-xl text-white transition-transform hover:scale-105 active:scale-95"
          title="Send"
        >
          <HiPaperAirplane className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
});

InteractiveChatSimulator.displayName = "InteractiveChatSimulator";

// ==========================================
// ACCORDION ITEM COMPONENT (MEMOIZED, ZERO LAG)
// ==========================================
const FAQItem = memo(({ item, isOpen, onClick }) => {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#121319] overflow-hidden transition-colors">
      <button
        onClick={onClick}
        type="button"
        className="w-full flex items-center justify-between p-5 text-left text-gray-900 dark:text-white font-semibold text-base sm:text-lg focus:outline-none"
      >
        <span>{item.question}</span>
        <HiChevronDown
          className={`w-5 h-5 text-indigo-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-5 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-white/[0.05] pt-3">
          {item.answer}
        </div>
      )}
    </div>
  );
});

FAQItem.displayName = "FAQItem";

// ==========================================
// MAIN HOMEPAGE COMPONENT
// ==========================================
const HomePage = () => {
  const userData = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  // Support Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [activeFaq, setActiveFaq] = useState(0);

  const [sendSupportMessage, { isLoading }] = useSendSupportMessageMutation();

  // Redirect if logged in
  useEffect(() => {
    if (userData) {
      navigate("/chat");
    }
  }, [userData, navigate]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!name.trim() || !email.trim() || !message.trim()) {
        toast.warning("Please fill out all required fields.");
        return;
      }

      try {
        await sendSupportMessage({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }).unwrap();

        toast.success(
          "Message sent successfully! Our team will respond shortly.",
          { autoClose: 3500 },
        );

        setName("");
        setEmail("");
        setMessage("");
      } catch (error) {
        toast.error(
          error?.data?.errorMessage ||
            "Failed to send message. Please try again.",
        );
      }
    },
    [name, email, message, sendSupportMessage],
  );

  const toggleFaq = useCallback((index) => {
    setActiveFaq((prev) => (prev === index ? -1 : index));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0d12] text-gray-900 dark:text-gray-100 overflow-x-hidden">
      {/* ============================================================== */}
      {/* HERO SECTION                                                  */}
      {/* ============================================================== */}
      <section
        id="home"
        className="relative pt-10 pb-16 md:pt-16 md:pb-24 border-b border-gray-200/60 dark:border-white/[0.06] bg-gradient-to-b from-indigo-950/10 via-transparent to-transparent"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-5">
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
                Instant Conversations. <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Zero Latency.
                </span>{" "}
                Total Privacy.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect instantly with friends, teammates, and communities.
                Experience blazing-fast messaging, crystal-clear WebRTC video
                calls, and group channels engineered for peak algorithmic
                performance.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/sign-up"
                  className="btn-grad w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-base font-bold text-white rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150 group uppercase tracking-wider"
                >
                  <span>Start Chatting Free</span>
                  <HiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#architecture"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-colors"
                >
                  <FiCpu className="w-4 h-4 mr-2 text-indigo-500" />
                  <span>Explore Architecture</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-gray-200/60 dark:border-white/[0.08] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1.5">
                  <HiCheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <HiShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>Strict Cookie Security</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <HiBolt className="w-4 h-4 text-amber-500" />
                  <span>Sub-Millisecond Pipeline</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Mock Chat */}
            <div className="lg:col-span-5">
              <InteractiveChatSimulator />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* PERFORMANCE & ALGORITHMIC ARCHITECTURE STATS (DSA SECTION)    */}
      {/* ============================================================== */}
      <section
        id="architecture"
        className="py-16 bg-white dark:bg-[#0f1017] border-b border-gray-200/80 dark:border-white/[0.06]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              High-Throughput Engineering
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
              Engineered with Extreme Algorithmic Performance
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-3">
              Replacing high-overhead HTTP polling loops with constant-time O(1)
              in-memory socket dispatch and peer-to-peer WebRTC media streams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS_DATA.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-gray-50 dark:bg-[#141620] border border-gray-200/80 dark:border-white/[0.06] shadow-sm transition-transform duration-150 ease-out hover:-translate-y-1 will-change-transform"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                      {stat.value}
                    </span>
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {stat.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                    {stat.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Architecture Pipeline Cards */}
          <div className="mt-14 pt-10 border-t border-gray-100 dark:border-white/[0.05]">
            <h3 className="text-center text-sm font-bold uppercase tracking-wider text-gray-500 mb-8">
              Real-Time End-to-End Data Pipeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {ARCHITECTURE_STEPS.map((step, sIdx) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={sIdx}
                    className="p-5 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.05] transition-transform duration-150 ease-out hover:-translate-y-1 will-change-transform"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                        {step.step}
                      </span>
                      <StepIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {step.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CORE FEATURES (MODERN BENTO GRID)                             */}
      {/* ============================================================== */}
      <section id="features" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Complete Feature Suite
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-2">
              Everything You Need for Modern Communication
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-3">
              Crafted with attention to micro-interactions, responsive
              adaptability, and enterprise-grade reliability.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENTO_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className={`p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#12131b] border border-gray-200/80 dark:border-white/[0.08] shadow-sm hover:shadow-md transition-transform duration-150 ease-out hover:-translate-y-1 will-change-transform flex flex-col justify-between ${feature.span}`}
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-white/[0.08]">
                        {feature.tag}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {feature.subtitle}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <span>Explore Capability</span>
                    <HiArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* TESTIMONIALS SECTION                                          */}
      {/* ============================================================== */}
      <section
        id="testimonials"
        className="py-16 bg-white dark:bg-[#0f1017] border-y border-gray-200/80 dark:border-white/[0.06]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Community Endorsements
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-2">
              Loved by Engineers &amp; Teams Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS_DATA.map((t, idx) => (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-gray-50 dark:bg-[#141620] border border-gray-200/80 dark:border-white/[0.06] shadow-sm flex flex-col justify-between transition-transform duration-150 ease-out hover:-translate-y-1 will-change-transform"
              >
                <div>
                  <div className="flex items-center space-x-1 text-amber-400 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <FiStar key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-5 mt-5 border-t border-gray-200/60 dark:border-white/[0.06]">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    loading="lazy"
                    className="w-10 h-10 rounded-full object-cover border border-indigo-500/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {t.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* FAQ SECTION (DSA OPTIMIZED ACCORDION)                         */}
      {/* ============================================================== */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-2">
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item, index) => (
            <FAQItem
              key={index}
              item={item}
              isOpen={activeFaq === index}
              onClick={() => toggleFaq(index)}
            />
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* CALL TO ACTION (CTA) BANNER                                    */}
      {/* ============================================================== */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#1c2c36] via-[#263c48] to-[#1c2c36] border border-gray-800 dark:border-white/[0.08] p-8 sm:p-12 text-center text-white shadow-xl">
          <div className="max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to Upgrade Your Real-Time Conversations?
            </h2>

            <p className="text-base text-gray-300 leading-relaxed">
              Create your account in under 30 seconds. Connect instantly, share
              media with ease, and start crystal-clear HD video calls right now.
            </p>

            <div className="pt-2">
              <Link
                to="/sign-up"
                className="btn-grad inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl text-white font-extrabold text-base hover:scale-105 active:scale-95 transition-transform duration-150 uppercase tracking-wider"
              >
                <span>Create Free Account</span>
                <HiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CONTACT & SUPPORT FORM SECTION                                */}
      {/* ============================================================== */}
      <section
        id="contact"
        className="py-16 bg-gray-100/70 dark:bg-[#0f1017] border-t border-gray-200/80 dark:border-white/[0.06]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Direct Support
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-2">
              Have Questions or Feedback?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
              Our engineering team is always on standby. Drop us a note and
              we'll reply directly to your email.
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-white dark:bg-[#14151e] p-7 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-white/[0.08] shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="support-name"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="support-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1b26] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="support-email"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="support-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1b26] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="support-message"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="support-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you today?"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1b26] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-grad w-full mt-2 py-3 px-6 rounded-xl font-bold text-sm text-white active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center justify-center space-x-2 uppercase tracking-wider"
              >
                {isLoading ? (
                  <span>Transmitting...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <FiSend className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default memo(HomePage);
