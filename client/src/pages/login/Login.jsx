import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../app/features/authSlice";
import { useNavigate } from "react-router-dom";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import { useLoginUserMutation } from "../../app/api/api";

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
    if (userData || data) {
      navigate("/chat");
    }
    if (data) {
      dispatch(setUser(data?.payload?.user));
    }
  }, [navigate, userData, data, dispatch]);

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
