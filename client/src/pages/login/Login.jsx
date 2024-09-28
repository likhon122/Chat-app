import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../app/features/authSlice";
import { useNavigate } from "react-router-dom";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import { useLoginUserMutation } from "../../app/api/api";
import { FiMail, FiLock } from "react-icons/fi";

const Login = () => {
  const userData = useSelector((state) => state.auth.user);
  const [loginUser, isLoading, data] = useAsyncMutation(useLoginUserMutation);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser("Login...", loginData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // if (userData || data) {
    //   navigate("/chat");
    // }

    if (data) {
      dispatch(setUser(data?.payload?.user));
    }
  }, [navigate, userData, data, dispatch]);

  return (
    <div className="flex justify-center items-center h-[85vh] md:h-screen ">
      <div className="bg-white dark:bg-[#2B2B2B] rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">
          Login
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
            <input
              type="email"
              name="email"
              id="email"
              value={loginData.email}
              placeholder="Enter your email"
              className="w-full py-2 pl-10 pr-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-[#3A3B3C] dark:text-white dark:border-[#444] dark:focus:ring-purple-500"
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
            <input
              type="password"
              name="password"
              id="password"
              value={loginData.password}
              placeholder="Enter your password"
              className="w-full py-2 pl-10 pr-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-[#3A3B3C] dark:text-white dark:border-[#444] dark:focus:ring-purple-500"
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 mt-4 text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 dark:bg-purple-600 dark:hover:bg-purple-500 transition duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
