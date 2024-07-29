// import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/home/Home";
import SignUp from "./pages/sign-up/SignUp";
import Login from "./pages/login/Login";
import NotFound from "./pages/not-found/404NotFound";
import Chat from "./pages/chat/Chat";
import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "..";
import { useDispatch } from "react-redux";
import { setUser } from "./app/features/authSlice";
import Verify from "./pages/sign-up/Verify";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<Home />} />
      <Route path="sign-up" element={<SignUp />} />
      <Route path="login" element={<Login />} />
      <Route path="chat" element={<Chat />} />
      <Route path="/api/v1/verify/:token" element={<Verify />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/v1/auth`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        });
        const user = response?.data?.payload?.user;
        dispatch(setUser(user));
      } catch (error) {
        console.error("Error fetching auth data:", error);
      }
    })();
  }, [dispatch]);

  return <RouterProvider router={router} />;
};

export default App;
