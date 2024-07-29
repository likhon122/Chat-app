import axios from "axios";
import { useEffect, useState } from "react";
import { serverUrl } from "../../..";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../app/features/authSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const userData = useSelector((state) => state.auth.user);

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
      const response = await axios.post(
        `${serverUrl}/api/v1/auth/login`,
        loginData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      const userData = response?.data?.payload?.user;
      dispatch(setUser(userData));
      navigate("/chat");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userData) {
      navigate("/chat");
    }
  }, [navigate, userData]);

  return (
    <>
      <div>
        <div className="flex justify-center items-center h-screen">
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={loginData.email}
                placeholder="Enter your email"
                className="border-black border"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="flex gap-2">
              <label htmlFor="password">Password</label>
              <input
                type="text"
                name="password"
                id="password"
                value={loginData.password}
                placeholder="Enter your password"
                className="border-black border"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div>
              <button type="submit" className="border-black border">
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
