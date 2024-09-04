import axios from "axios";
import { useEffect, useState } from "react";
import { serverUrl } from "../../..";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../app/features/authSlice";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { FaInfoCircle } from "react-icons/fa";
import { toast } from "react-toastify";

const SignUp = () => {
  const userData = useSelector((state) => state.auth.user);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    avatar: {},
    bio: "" // Add bio field here
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "avatar") {
      setSignUpData((prevState) => ({
        ...prevState,
        avatar: files[0]
      }));
      setAvatarPreview(URL.createObjectURL(files[0]));
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
    const loadingToastId = toast.loading("Sign-up...");

    const formData = new FormData();
    Object.keys(signUpData).forEach((key) => {
      // Append only if the value exists
      if (signUpData[key]) {
        formData.append(key, signUpData[key]);
      }
    });

    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
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
      toast.update(loadingToastId, {
        render: response?.data?.successMessage || "Something went wrong",
        type: "success",
        isLoading: false,
        autoClose: 5000,
        closeButton: true
      });

      setSuccessMessage(response?.data?.successMessage);
      setSignUpData({
        name: "",
        username: "",
        email: "",
        password: "",
        avatar: {},
        bio: ""
      });
    } catch (error) {
      toast.update(loadingToastId, {
        render: error.response.data.errorMessage || "Something went wrong",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true
      });

      setSignUpLoading(false);
      setErrorMessage(error.response.data.errorMessage);

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
    <div className="flex justify-center items-center min-h-screen dark:bg-[#222222]">
      <div className="bg-white dark:bg-[#2B2B2B] rounded-lg shadow-lg p-8 max-w-md w-full relative">
        <div
          className="absolute top-4 right-4 cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <FaInfoCircle className="text-gray-600 dark:text-gray-300 text-2xl" />
          {showTooltip && (
            <div className="absolute right-0 w-48 bg-gray-600 text-white text-sm p-2 rounded-lg shadow-lg transition-opacity duration-300 opacity-100">
              <div className="relative">
                <div className="absolute -top-2 right-1 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-gray-800 transform rotate-180"></div>
                You can sign up without profile picture or bio!!
              </div>
            </div>
          )}
        </div>
        {errorMessage && (
          <div className="mb-4 text-red-500 text-center">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="mb-4 text-green-500 text-center">
            {successMessage}
          </div>
        )}
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">
          Sign Up
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center mb-4">
            <label className="cursor-pointer">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm text-center">
                    Upload Avatar (Optional)
                  </span>
                )}
              </div>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>
          {/* Input Fields */}
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
            <input
              type="text"
              name="name"
              id="name"
              value={signUpData.name}
              placeholder="Enter your name"
              className="w-full py-2 pl-10 pr-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-[#3A3B3C] dark:text-white dark:border-[#444] dark:focus:ring-purple-500"
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
            <input
              type="text"
              name="username"
              id="username"
              value={signUpData.username}
              placeholder="Enter your username"
              className="w-full py-2 pl-10 pr-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-[#3A3B3C] dark:text-white dark:border-[#444] dark:focus:ring-purple-500"
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
            <input
              type="email"
              name="email"
              id="email"
              value={signUpData.email}
              placeholder="Enter your email"
              className="w-full py-2 pl-10 pr-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-[#3A3B3C] dark:text-white dark:border-[#444] dark:focus:ring-purple-500"
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
            <input
              type="password"
              name="password"
              id="password"
              value={signUpData.password}
              placeholder="Enter your password"
              className="w-full py-2 pl-10 pr-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-[#3A3B3C] dark:text-white dark:border-[#444] dark:focus:ring-purple-500"
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>
          {/* Bio Textarea */}
          <div className="relative">
            <textarea
              name="bio"
              id="bio"
              value={signUpData.bio}
              placeholder="Tell us about yourself (optional)"
              className="w-full h-24 py-2 pl-3 pr-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-[#3A3B3C] dark:text-white dark:border-[#444] dark:focus:ring-purple-500 resize-none"
              onChange={handleChange}
              maxLength={250} // Optional: Limit bio length
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 mt-4 text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 dark:bg-purple-600 dark:hover:bg-purple-500 transition duration-300"
            disabled={signUpLoading}
          >
            {signUpLoading ? "Signing up..." : "Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
