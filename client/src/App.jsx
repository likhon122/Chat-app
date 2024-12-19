import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider
} from "react-router-dom";
import { useVerifyUserQuery } from "./app/api/api";
import { setUser } from "./app/features/authSlice";
import DuelSpinner from "./components/Loaders/DuelSpinner";
import Layout from "./Layout";
import Chat from "./pages/chat/Chat";
import CallWindowPage from "./pages/chat/message/CallWindowPage";
import ShowChat from "./pages/chat/ShowChats";
import Friends from "./pages/friends/Friends";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import MyGroups from "./pages/myGroups/MyGroups";
import NotFound from "./pages/not-found/404NotFound";
import Profile from "./pages/profile/Profile";
import SignUp from "./pages/sign-up/SignUp";
import Verify from "./pages/sign-up/Verify";
import PushNotificationManager from "./PushNotificationManager";
import EditProfile from "./pages/profile/EditProfile";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import ResetPassword from "./pages/forgot-password/ResetPassword";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Protected Route component for authentication
const ProtectedRoute = ({ user, isLoading, children }) => {
  const userData = useSelector((state) => state.auth.user);
  if (!isLoading && !user && !userData) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Check if the user is already logged in to redirect to chat
const CheckUserIsLoggedOut = ({ user, isLoading, children }) => {
  const userData = useSelector((state) => state.auth.user);
  if (!isLoading && user && userData) {
    return <Navigate to="/chat" />;
  }

  return children;
};

const App = () => {
  const dispatch = useDispatch();

  const {
    data,
    isLoading: mountLoading,
    isError
  } = useVerifyUserQuery();
  const user = data?.payload?.user;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mountLoading && data && data.payload?.user) {
      dispatch(setUser(data.payload.user));
      setIsLoading(false);
    }
    if (isError) {
      setIsLoading(false);
    }
  }, [dispatch, data, mountLoading, isError]);

  if (isLoading) {
    return (
      <div className="h-screen dark:bg-darkBg flex items-center justify-center">
        <DuelSpinner />
      </div>
    );
  }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <CheckUserIsLoggedOut user={user} isLoading={isLoading}>
                <Home />
              </CheckUserIsLoggedOut>
            }
          />
          <Route
            path="sign-up"
            element={
              <CheckUserIsLoggedOut user={user} isLoading={isLoading}>
                <SignUp />
              </CheckUserIsLoggedOut>
            }
          />
          <Route
            path="login"
            element={
              <CheckUserIsLoggedOut user={user} isLoading={isLoading}>
                <Login />
              </CheckUserIsLoggedOut>
            }
          />
          <Route
            path="forgot-password"
            element={
              <CheckUserIsLoggedOut user={user} isLoading={isLoading}>
                <ForgotPassword />
              </CheckUserIsLoggedOut>
            }
          />
          <Route
            path="chat"
            element={
              <ProtectedRoute user={user} isLoading={isLoading}>
                <ShowChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="chat/:chatId"
            element={
              <ProtectedRoute user={user} isLoading={isLoading}>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route path="/api/v1/verify/:token" element={<Verify />} />
          <Route
            path="profile/:userId"
            element={
              <ProtectedRoute user={user} isLoading={isLoading}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="friends/:userId"
            element={
              <ProtectedRoute user={user} isLoading={isLoading}>
                <Friends />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-groups/:groupId"
            element={
              <ProtectedRoute user={user} isLoading={isLoading}>
                <MyGroups />
              </ProtectedRoute>
            }
          />
          <Route
            path="call/:chatId"
            element={
              <ProtectedRoute user={user} isLoading={isLoading}>
                <CallWindowPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="edit-profile/:userId"
            element={
              <ProtectedRoute user={user} isLoading={isLoading}>
                <EditProfile />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/reset-password/:token"
          element={
            <CheckUserIsLoggedOut user={user} isLoading={isLoading}>
              <ResetPassword />
            </CheckUserIsLoggedOut>
          }
        />
        <Route path="*" element={<NotFound />} />
      </>
    )
  );

  return (
    <>
      {user?._id && (
        <PushNotificationManager
          userId={user._id}
          pushNotificationPublicKey={VAPID_PUBLIC_KEY}
        />
      )}
      <RouterProvider router={router} />
    </>
  );
};

export default App;
