import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../../..";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

const Verify = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verifyLoginLoading, setVerifyLoginLoading] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");
  const hasFetched = useRef(false); 

  useEffect(() => {
    if (hasFetched.current) return; 
    hasFetched.current = true; 

    const loadingToastId = toast.loading("Verifying...");
    setVerifyLoginLoading(true);

    const verifyToken = async () => {
      try {
        if (!token) {
          setVerifyMessage(
            "Something went wrong! Ensure you provide our verify token through your email."
          );
          toast.update(loadingToastId, {
            render:
              "Something went wrong! Ensure you provide our verify token through your email.",
            type: "error",
            isLoading: false,
            autoClose: 5000,
            closeButton: true
          });
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
          setVerifyMessage("Sign up successfully! Redirecting to login page!");
          toast.update(loadingToastId, {
            render: "Sign up successfully! Redirecting to login page!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
            closeButton: true
          });
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setVerifyMessage(
            "Verification failed! Please try again later or contact support."
          );
          toast.update(loadingToastId, {
            render:
              "Verification failed! Please try again later or contact support.",
            type: "error",
            isLoading: false,
            autoClose: 5000,
            closeButton: true
          });
        }
      } catch (error) {
        setVerifyMessage(
          "Something went wrong! Ensure you verify your email within 5 minutes."
        );
        toast.update(loadingToastId, {
          render:
            "Something went wrong! Ensure you verify your email within 5 minutes.",
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-[#222222]">
      {verifyLoginLoading ? (
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full text-orange-500 dark:text-blue-500"></div>
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
            Verifying...
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
            {verifyMessage}
          </p>
        </div>
      )}
    </div>
  );
};

export default Verify;
