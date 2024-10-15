import { useEffect, useState } from "react";
import { FiMail } from "react-icons/fi";
import { useDispatch } from "react-redux";

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
    await forgotPassword("Sending a verification mail...", { email });
  };

  useEffect(() => {
    let successTimeOut, errorTimeOut;
    if (data) {
      setSuccessMessage(data.successMessage);
      setEmail("");
      successTimeOut = setTimeout(() => setSuccessMessage(""), 6000);
    }

    if (error) {
      setErrorMessage(error.data?.errorMessage || "Something went wrong!!");
      errorTimeOut = setTimeout(() => setErrorMessage(""), 6000);
    }

    return () => {
      clearTimeout(successTimeOut);
      clearTimeout(errorTimeOut);
    };
  }, [error, data, dispatch]);

  return (
    <>
      <div className="flex justify-center items-center h-screen md:h-screen ">
        <div className="bg-white dark:bg-[#2B2B2B] rounded-lg shadow-lg p-8 max-w-md w-full relative">
          <div className="flex items-center justify-center">
            <div
              className={`absolute ${
                errorMessage ? "top-[-40px]" : "top-[-90px]"
              }`}
            >
              {errorMessage && (
                <div className=" text-red-500 text-center sm:text-lg font-semibold">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className=" text-green-500 text-center">
                  {successMessage}
                </div>
              )}
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">
            Forgot your password
          </h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                required
                placeholder="Enter your email *"
                className="w-full py-2 pl-10 pr-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-[#3A3B3C] dark:text-white dark:border-[#444] dark:focus:ring-purple-500"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 my-2 cursor-pointer text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 dark:bg-purple-600 dark:hover:bg-purple-500 transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Forgot Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
