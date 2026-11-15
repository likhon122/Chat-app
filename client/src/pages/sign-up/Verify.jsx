import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { serverUrl } from "../../..";
import axios from "axios";
import { toast } from "../../utils/alert";
import { HiChatBubbleLeftRight, HiCheckCircle, HiXCircle } from "react-icons/hi2";
import SingleSpinner from "../../components/Loaders/SingleSpinner";

const Verify = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verifyLoginLoading, setVerifyLoginLoading] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadingToastId = toast.loading("Verifying your email...");
    setVerifyLoginLoading(true);

    const verifyToken = async () => {
      try {
        if (!token) {
          const msg = "Invalid verification token. Please check your email link.";
          setVerifyMessage(msg);
          setIsSuccess(false);
          toast.error(msg, { id: loadingToastId, duration: 5000 });
          return;
        }

        const response = await axios.post(
          `${serverUrl}/api/v1/user/verify`,
          { token },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        const data = response?.data;

        if (data?.success) {
          const msg = "Account verified successfully! Redirecting to sign in...";
          setVerifyMessage(msg);
          setIsSuccess(true);
          toast.success(msg, { id: loadingToastId, duration: 3000 });
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          const msg = "Verification failed! Please try again or contact support.";
          setVerifyMessage(msg);
          setIsSuccess(false);
          toast.error(msg, { id: loadingToastId, duration: 5000 });
        }
      } catch (error) {
        const msg =
          error?.response?.data?.errorMessage ||
          "Verification link expired or invalid. Please sign up again.";
        setVerifyMessage(msg);
        setIsSuccess(false);
        toast.update(loadingToastId, {
          render: msg,
          type: "error",
          isLoading: false,
          autoClose: 5000,
          closeButton: true
        });
        setTimeout(() => {
          navigate("/sign-up");
        }, 5000);
      } finally {
        setVerifyLoginLoading(false);
      }
    };

    verifyToken();
  }, [navigate, token]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#0c0d12] relative selection:bg-indigo-500 selection:text-white">
      {/* Background ambient accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-white dark:bg-[#12131b] border border-gray-200/80 dark:border-white/[0.08] rounded-3xl shadow-xl p-8 sm:p-10 text-center relative">
        {/* Brand Logo & Header */}
        <div className="mb-6">
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
            Email Verification
          </h2>
        </div>

        {verifyLoginLoading ? (
          <div className="py-8 space-y-4">
            <SingleSpinner size="w-10 h-10" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Validating your verification token...
            </p>
          </div>
        ) : (
          <div className="py-4 space-y-5">
            <div
              className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center ${
                isSuccess
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-500"
              }`}
            >
              {isSuccess ? <HiCheckCircle className="w-8 h-8" /> : <HiXCircle className="w-8 h-8" />}
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
              {verifyMessage}
            </p>
            <div className="pt-2">
              <Link
                to={isSuccess ? "/login" : "/sign-up"}
                className="btn-grad inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-xs font-bold text-white uppercase tracking-wider"
              >
                {isSuccess ? "Proceed to Sign In" : "Try Registering Again"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;
