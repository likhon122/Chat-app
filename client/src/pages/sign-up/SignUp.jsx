import axios from "axios";
import { useEffect, useState } from "react";
import { serverUrl } from "../../..";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../app/features/authSlice";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const userData = useSelector((state) => state.auth.user);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [signUpData, setSignUpData] = useState({
    name: "",
    username: "",
    email: "",
    password: ""
  });

  // const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignUpData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${serverUrl}/api/v1/user/process-register`,
        signUpData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      setSuccessMessage(response?.data?.successMessage);
    } catch (error) {
      setErrorMessage(error.response.data.errorMessage);
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
        <div>{errorMessage && errorMessage}</div>
        <div>{successMessage && successMessage}</div>
        <div className="flex justify-center items-center h-screen">
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={signUpData.name}
                placeholder="Enter your name"
                className="border-black border"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="flex gap-2">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                name="username"
                id="username"
                value={signUpData.username}
                placeholder="Enter your username"
                className="border-black border"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="flex gap-2">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={signUpData.email}
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
                value={signUpData.password}
                placeholder="Enter your password"
                className="border-black border"
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div>
              <button type="submit" className="border-black border">
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;
