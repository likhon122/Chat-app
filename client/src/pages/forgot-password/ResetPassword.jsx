import { useEffect, useState } from "react";
import { FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { HiChatBubbleLeftRight, HiArrowRight, HiCheckCircle } from "react-icons/hi2";

import { useResetPasswordMutation } from "../../app/api/api";
import SingleSpinner from "../../components/Loaders/SingleSpinner";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";

const ResetPassword = () => {
  const params = useParams();
  const token = params.token;

  const [resetPasswordHandler, isLoading, data, error] = useAsyncMutation(
    useResetPasswordMutation
  );

  const [resetPasswordData, setResetPasswordData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [redirectingLoading, setRedirectingLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResetPasswordData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFocus = () => {
    setConfirmPasswordFocus(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      return;
    }

    const resetPasswordDataWithToken = {
      password: resetPasswordData.password,
      token
    };

    await resetPasswordHandler(
      "Resetting password...",
      resetPasswordDataWithToken
    );
  };

  useEffect(() => {
    let errorTimeOut, successTimeOut;
    if (data) {
      setRedirectingLoading(true);
      setSuccessMessage(
        "Password reset successfully! Redirecting you to the sign in page..."
      );
      setResetPasswordData({
        password: "",
        confirmPassword: ""
      });
      successTimeOut = setTimeout(() => {
        setSuccessMessage("");
        setRedirectingLoading(false);
        navigate("/login");
      }, 4000);
    }
    if (error) {
      setErrorMessage(
        error.data?.errorMessage ||
          "Password reset failed. The link may have expired or is invalid. Please request a new one."
      );
      errorTimeOut = setTimeout(() => {
        setErrorMessage("");
      }, 8000);
    }
    return () => {
      clearTimeout(successTimeOut);
      clearTimeout(errorTimeOut);
    };
  }, [data, error, navigate, dispatch]);

  const passwordsMatch =
    !confirmPasswordFocus ||
    resetPasswordData.password === resetPasswordData.confirmPassword;

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
            Set New Password
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create a secure, strong password for your account
          </p>
        </div>

        {/* Feedback banners */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold text-center leading-relaxed">
            {errorMessage}
          </div>
        )}

        {successMessage ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
              <HiCheckCircle className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 leading-relaxed">
              {successMessage}
            </p>
            {redirectingLoading && (
              <div className="pt-2 flex justify-center">
                <SingleSpinner size="w-8 h-8" />
              </div>
            )}
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-base" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={resetPasswordData.password}
                  required
                  placeholder="Enter your new password"
                  className="w-full py-3 pl-10 pr-10 text-sm bg-gray-50 dark:bg-[#181924] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  onChange={handleChange}
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-base" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  value={resetPasswordData.confirmPassword}
                  required
                  placeholder="Re-enter your new password"
                  className={`w-full py-3 pl-10 pr-10 text-sm bg-gray-50 dark:bg-[#181924] border ${
                    !passwordsMatch
                      ? "border-rose-500 focus:ring-rose-500/30"
                      : "border-gray-200 dark:border-white/[0.08] focus:border-indigo-500 focus:ring-indigo-500/30"
                  } rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                </button>
              </div>
              {!passwordsMatch && (
                <p className="text-xs text-rose-500 font-semibold mt-1.5">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-grad w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center justify-center space-x-2 uppercase tracking-wider shadow-md mt-6"
              disabled={
                isLoading ||
                resetPasswordData.password !== resetPasswordData.confirmPassword ||
                !resetPasswordData.password
              }
            >
              {isLoading ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <span>Reset Password</span>
                  <HiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
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

export default ResetPassword;
