import axios from "axios";
import { useEffect, useState } from "react";
import { serverUrl } from "../../..";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiCamera, FiEye, FiEyeOff } from "react-icons/fi";
import { HiChatBubbleLeftRight, HiArrowRight, HiSparkles } from "react-icons/hi2";
import { toast } from "../../utils/alert";

const SignUp = () => {
  const userData = useSelector((state) => state.auth.user);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [signUpData, setSignUpData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    avatar: {},
    bio: ""
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "avatar") {
      if (files && files[0]) {
        setSignUpData((prevState) => ({
          ...prevState,
          avatar: files[0]
        }));
        setAvatarPreview(URL.createObjectURL(files[0]));
      }
    } else {
      setSignUpData((prevState) => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSignUpLoading(true);
    const loadingToastId = toast.loading("Creating your account...");

    const formData = new FormData();
    Object.keys(signUpData).forEach((key) => {
      if (signUpData[key]) {
        formData.append(key, signUpData[key]);
      }
    });

    try {
      const response = await axios.post(
        `${serverUrl}/api/v1/user/process-register`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setSignUpLoading(false);
      toast.success(
        response?.data?.successMessage ||
          "Registration successful! Please check your email to verify.",
        { id: loadingToastId, duration: 5000 }
      );

      setSuccessMessage(response?.data?.successMessage || "Registration email sent!");
      setSignUpData({
        name: "",
        username: "",
        email: "",
        password: "",
        avatar: {},
        bio: ""
      });
      setAvatarPreview(null);
    } catch (error) {
      const errorMsg =
        error?.response?.data?.errorMessage || "Something went wrong. Please try again.";
      toast.error(errorMsg, { id: loadingToastId, duration: 5000 });

      setSignUpLoading(false);
      setErrorMessage(errorMsg);

      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }
  };

  useEffect(() => {
    if (userData) {
      navigate("/chat");
    }
  }, [navigate, userData]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#0c0d12] relative selection:bg-indigo-500 selection:text-white">
      {/* Background ambient accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-lg bg-white dark:bg-[#12131b] border border-gray-200/80 dark:border-white/[0.08] rounded-3xl shadow-xl p-8 sm:p-10 relative">
        {/* Brand Logo & Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-2.5 group mb-3">
            <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
              <HiChatBubbleLeftRight className="w-6 h-6" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#12131b]" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-800 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              ChatApp
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Create an Account
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Join thousands communicating with zero latency &amp; WebRTC calls
          </p>
        </div>

        {/* Feedback banners */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold text-center">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold text-center">
            {successMessage}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Avatar Upload (Sleek Circle) */}
          <div className="flex flex-col items-center mb-2">
            <label className="cursor-pointer group relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-indigo-500 flex items-center justify-center bg-gray-50 dark:bg-[#181924] transition-all">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 transition-colors">
                    <FiCamera className="text-xl" />
                    <span className="text-[10px] mt-1 font-semibold">Avatar</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
              <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 text-white shadow-md group-hover:scale-110 transition-transform">
                <FiCamera className="w-3 h-3" />
              </span>
            </label>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              Profile picture is optional
            </span>
          </div>

          {/* Name & Username Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-base" />
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={signUpData.name}
                  placeholder="Alex Rivera"
                  className="w-full py-2.5 pl-10 pr-3.5 text-sm bg-gray-50 dark:bg-[#181924] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-mono font-bold">
                  @
                </span>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={signUpData.username}
                  placeholder="alexrivera"
                  className="w-full py-2.5 pl-10 pr-3.5 text-sm bg-gray-50 dark:bg-[#181924] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-mono"
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>
            </div>
          </div>

          {/* Email */}
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
                value={signUpData.email}
                placeholder="you@example.com"
                className="w-full py-2.5 pl-10 pr-3.5 text-sm bg-gray-50 dark:bg-[#181924] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-base" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={signUpData.password}
                placeholder="Choose a strong password"
                className="w-full py-2.5 pl-10 pr-10 text-sm bg-gray-50 dark:bg-[#181924] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
              </button>
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="bio"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
              >
                Bio
              </label>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">Optional</span>
            </div>
            <textarea
              name="bio"
              id="bio"
              rows={2}
              value={signUpData.bio}
              placeholder="Tell us a little bit about yourself..."
              className="w-full py-2.5 px-3.5 text-sm bg-gray-50 dark:bg-[#181924] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
              onChange={handleChange}
              maxLength={250}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn-grad w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center justify-center space-x-2 uppercase tracking-wider shadow-md mt-4"
            disabled={signUpLoading}
          >
            {signUpLoading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Create Free Account</span>
                <HiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/[0.06] text-center text-xs text-gray-500 dark:text-gray-400">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
