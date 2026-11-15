import { useEffect, useState } from "react";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { HiChatBubbleLeftRight, HiArrowRight } from "react-icons/hi2";

import { useForgotPasswordMutation } from "../../app/api/api";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";

const ForgotPassword = () => {
  const [forgotPassword, isLoading, data, error] = useAsyncMutation(
    useForgotPasswordMutation
  );

  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword("Sending verification email...", { email });
  };

  useEffect(() => {
    let successTimeOut, errorTimeOut;
    if (data) {
      setSuccessMessage(data.successMessage || "Password reset link has been dispatched to your email!");
      setEmail("");
      successTimeOut = setTimeout(() => setSuccessMessage(""), 6000);
    }

    if (error) {
      setErrorMessage(error.data?.errorMessage || "Something went wrong! Please try again.");
      errorTimeOut = setTimeout(() => setErrorMessage(""), 6000);
    }

    return () => {
      clearTimeout(successTimeOut);
      clearTimeout(errorTimeOut);
    };
  }, [error, data, dispatch]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#0c0d12] relative selection:bg-indigo-500 selection:text-white">
      {/* Background ambient accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-white dark:bg-[#12131b] border border-gray-200/80 dark:border-white/[0.08] rounded-3xl shadow-xl p-8 sm:p-10 relative">
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
            Forgot Password
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter your registered email to receive a recovery link
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
                value={email}
                required
                placeholder="Enter your email"
                className="w-full py-3 pl-10 pr-4 text-sm bg-gray-50 dark:bg-[#181924] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-grad w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center justify-center space-x-2 uppercase tracking-wider shadow-md mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Sending Email...</span>
            ) : (
              <>
                <span>Send Reset Link</span>
                <HiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/[0.06] text-center">
          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
