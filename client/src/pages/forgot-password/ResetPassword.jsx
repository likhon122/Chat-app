import { useEffect, useState } from "react";
import { FiLock } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

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
        "Password reset successfully!! Redirecting to you in login page !!"
      );
      setResetPasswordData({
        password: "",
        confirmPassword: ""
      });
      successTimeOut = setTimeout(() => {
        setSuccessMessage("");
        setRedirectingLoading(false);
        navigate("/login");
      }, 6000);
    }
    if (error) {
      setErrorMessage(
        error.data?.errorMessage ||
          "Something is wrong! Please try again! Token is not valid! Please send valid token! We think token is expired!!!"
      );
      errorTimeOut = setTimeout(() => {
        setErrorMessage("");
      }, 9000);
    }
    return () => {
      clearTimeout(successTimeOut);
      clearTimeout(errorTimeOut);
    };
  }, [data, error, navigate, dispatch]);

  return (
    <div className="flex justify-center items-center h-screen ">
      <div className={`${!successMessage ? "hidden" : "block"} h-[70%]`}>
        <div className="flex items-center justify-center flex-col gap-10">
          <div className="text-green-500 text-center">{successMessage}</div>
          {redirectingLoading && <SingleSpinner size="h-16 w-16" />}
        </div>
      </div>
      <div
        className={`bg-white dark:bg-[#2B2B2B] rounded-lg shadow-lg p-8 max-w-md w-full relative ${
          successMessage && "hidden"
        }`}
      >
        <div className="flex items-center justify-center">
          <div
            className={`absolute ${
              errorMessage ? "top-[-90px]" : "top-[-90px]"
            }`}
          >
            {errorMessage && (
              <div className=" text-red-500 text-center sm:text-lg font-semibold">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">
          Reset Your Password
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
            <input
              type="password"
              name="password"
              id="password"
              value={resetPasswordData.password}
              required
              placeholder="Enter your Password *"
              className="w-full py-2 pl-10 pr-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-[#3A3B3C] dark:text-white dark:border-[#444] dark:focus:ring-purple-500"
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={resetPasswordData.confirmPassword}
              required
              placeholder="Enter your Confirm Password *"
              className="w-full py-2 pl-10 pr-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-[#3A3B3C] dark:text-white dark:border-[#444] dark:focus:ring-purple-500"
              onChange={handleChange}
              onFocus={handleFocus}
            />
          </div>

          {confirmPasswordFocus &&
            resetPasswordData.password !==
              resetPasswordData.confirmPassword && (
              <div className="text-red-500 text-sm">Passwords do not match</div>
            )}

          <button
            type="submit"
            className="w-full disabled:cursor-not-allowed cursor-pointer py-2 my-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 dark:bg-purple-600 dark:hover:bg-purple-500 transition duration-300"
            disabled={
              isLoading ||
              resetPasswordData.password !== resetPasswordData.confirmPassword
            }
          >
            {isLoading ? "Loading..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
