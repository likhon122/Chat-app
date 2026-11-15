import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../app/features/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import { useLoginUserMutation } from "../../app/api/api";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import {
  HiChatBubbleLeftRight,
  HiArrowRight,
  HiBolt,
} from "react-icons/hi2";

const DEMO_ACCOUNTS = [
  {
    id: "fahim",
    name: "Fahim Hossen",
    role: "Admin • Host",
    email: "fahimhossen2x@gmail.com",
    password: "123456",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    btnGrad:
      "from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20",
    avatarBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
  },
  {
    id: "likhon",
    name: "Likhon Islam",
    role: "Admin • Peer",
    email: "md.likhonislam2x@gmail.com",
    password: "123456",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    btnGrad:
      "from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/20",
    avatarBg: "bg-gradient-to-br from-purple-500 to-indigo-600",
  },
];

const Login = () => {
  const userData = useSelector((state) => state.auth.user);
  const [loginUser, isLoading, data] = useAsyncMutation(useLoginUserMutation);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeQuickId, setActiveQuickId] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      await loginUser("Logging in...", loginData);
    } catch (error) {
      console.error(error);
    }
  };

  // Instant 1-click login handler for interviewer demo accounts
  const handleInstantLogin = async (account) => {
    setLoginData({
      email: account.email,
      password: account.password,
    });
    setActiveQuickId(account.id);
    try {
      await loginUser(`Signing in as ${account.name}...`, {
        email: account.email,
        password: account.password,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setActiveQuickId(null);
    }
  };

  // Copy helper for interviewer convenience
  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 1800);
  };

  // Auto-fill inputs without submitting
  const handleFillOnly = (account) => {
    setLoginData({
      email: account.email,
      password: account.password,
    });
  };

  useEffect(() => {
    if (data) {
      dispatch(setUser(data?.payload?.user));
      navigate("/chat");
    }
  }, [navigate, userData, data, dispatch]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#08090d] relative ">
      {/* Background ambient accents matching Home page */}
      

      <div className="w-full max-w-lg bg-white dark:bg-[#12131b]/95  border-gray-200/80 dark:border-white/[0.08] rounded-3xl  p-6 sm:p-8 lg:p-10 relative">
        {/* Brand Logo & Header */}
        <div className="text-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center space-x-2.5 group mb-3"
          >
            <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-300">
              <HiChatBubbleLeftRight className="w-6 h-6" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-[#12131b] shadow-[0_0_6px_#34d399]" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-800 dark:from-white dark:via-cyan-100 dark:to-gray-300 bg-clip-text text-transparent">
              ChatApp
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Sign in to access your channels, friends &amp; HD WebRTC calls
          </p>
        </div>

        {/* ============================================================== */}
        {/* INTERVIEWER / TESTER READY-MADE 1-CLICK DEMO ACCOUNTS */}
        {/* ============================================================== */}
        <div className="mb-6 p-4 rounded-2xl  border border-cyan-500/25 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <HiBolt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">
                  Interviewer Quick Access
                </h3>
                <p className="text-[11px] text-gray-400">
                  Ready-made demo accounts for instant evaluation
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              1-CLICK LOGIN
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {DEMO_ACCOUNTS.map((account) => {
              const isThisLoading = isLoading && activeQuickId === account.id;
              const isEmailCopied = copiedKey === `${account.id}-email`;

              return (
                <div
                  key={account.id}
                  className="p-3 rounded-xl bg-white/[0.04] dark:bg-black/30 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Email & Password snippet with copy */}
                    <div className="space-y-1 mb-3 text-[11px]">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="truncate font-mono text-[10px]">
                          {account.email}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(account.email, `${account.id}-email`)
                          }
                          title="Copy email"
                          className="p-1 hover:text-white transition cursor-pointer"
                        >
                          {isEmailCopied ? (
                            <FiCheck className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <FiCopy className="w-3 h-3 text-gray-400 hover:text-white" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-gray-500 text-[10px]">
                        <span>
                          Password:{" "}
                          <code className="text-gray-300 font-mono">
                            123456
                          </code>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: 1-Click Instant Login + Fill */}
                  <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => handleInstantLogin(account)}
                      disabled={isLoading}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg bg-gradient-to-r ${account.btnGrad} text-white text-[11px] font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50`}
                    >
                      {isThisLoading ? (
                        <span>Signing In...</span>
                      ) : (
                        <>
                          <HiBolt className="w-3 h-3" />
                          <span>Sign In</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillOnly(account)}
                      title="Fill inputs only"
                      className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[10px] font-semibold border border-white/10 transition cursor-pointer"
                    >
                      Fill
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-gray-200 dark:border-white/10" />
          <span className="flex-shrink mx-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            or sign in manually
          </span>
          <div className="flex-grow border-t border-gray-200 dark:border-white/10" />
        </div>

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-base" />
              <input
                type="email"
                name="email"
                id="email"
                required
                value={loginData.email}
                placeholder="you@example.com"
                className="w-full py-3 pl-10 pr-4 text-sm bg-gray-50 dark:bg-[#181924] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-base" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                required
                value={loginData.password}
                placeholder="Enter your password"
                className="w-full py-3 pl-10 pr-10 text-sm bg-gray-50 dark:bg-[#181924] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FiEyeOff className="text-base" />
                ) : (
                  <FiEye className="text-base" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center justify-center space-x-2 uppercase tracking-wider mt-6 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading && !activeQuickId ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <HiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/[0.06] text-center text-xs text-gray-500 dark:text-gray-400">
          <span>Don't have an account? </span>
          <Link
            to="/sign-up"
            className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
