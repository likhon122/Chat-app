import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate
} from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/home/Home";
import SignUp from "./pages/sign-up/SignUp";
import Login from "./pages/login/Login";
import NotFound from "./pages/not-found/404NotFound";
import Chat from "./pages/chat/Chat";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./app/features/authSlice";
import Verify from "./pages/sign-up/Verify";
import { useVerifyUserQuery } from "./app/api/api";
import ShowChat from "./pages/chat/ShowChats";
import Profile from "./pages/profile/Profile";
import Friends from "./pages/friends/Friends";
import MyGroups from "./pages/myGroups/MyGroups";
import DuelSpinner from "./components/Loaders/DuelSpinner";
import PushNotificationManager from "./PushNotificationManager";
import Dashboard from "./pages/admin/Dashboard";
import MainLayout from "./pages/admin/MainLayout";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Protected Route component for authentication
const ProtectedRoute = ({ user, isLoading, children }) => {
  console.log("ProtectedRoute - User:", user);

  if (isLoading) {
    return (
      <div className="h-screen dark:bg-darkBg flex items-center justify-center">
        <DuelSpinner /> {/* Show spinner while loading */}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const CheckUserIsLoggedIn = ({ user, isLoading, children }) => {
  console.log("CheckUserIsLoggedIn - User:", user);

  if (isLoading) {
    return (
      <div className="h-screen dark:bg-darkBg flex items-center justify-center">
        <DuelSpinner />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const { data, isLoading, isError, error } = useVerifyUserQuery();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (data && data.payload?.user) {
      dispatch(setUser(data.payload.user));
    }
  }, [dispatch, data]);

  if (isLoading) {
    return (
      <div className="h-screen dark:bg-darkBg flex items-center justify-center">
        <DuelSpinner />
      </div>
    );
  }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route
          path=""
          element={
            <CheckUserIsLoggedIn user={user} isLoading={isLoading}>
              <Home />
            </CheckUserIsLoggedIn>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute user={user} isLoading={isLoading}>
              <MainLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="sign-up"
          element={
            <CheckUserIsLoggedIn user={user} isLoading={isLoading}>
              <SignUp />
            </CheckUserIsLoggedIn>
          }
        />
        <Route
          path="login"
          element={
            <CheckUserIsLoggedIn user={user} isLoading={isLoading}>
              <Login />
            </CheckUserIsLoggedIn>
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
        <Route path="*" element={<NotFound />} />
      </Route>
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
