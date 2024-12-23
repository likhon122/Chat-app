import express from "express";

import {
  verifyUserController,
  processRegisterController,
  getSingleUser,
  getAllUsers,
  searchUser,
  sendRequest,
  acceptRequest,
  deleteRequest,
  getFriends,
  getFriendRequestNotifications,
  getPendingFriendRequests,
  editProfile,
  forGotPassword,
  resetPassword,
  onlineUsers
} from "../controllers/user.controller.js";
import { isAdmin, isLoggedIn, isLoggedOut } from "../middlewares/auth.js";
import {
  acceptFriendRequestValidation,
  deleteFriendRequestValidation,
  forgotPasswordValidation,
  registerUserValidation,
  resetPasswordValidation,
  sendFriendRequestValidation,
  verifyUserRegistrationValidation
} from "../validation/userValidation.js";
import runValidation from "../validation/runValidation.js";
import { singleAvatar } from "../middlewares/multer.js";

const userRoute = express.Router();

userRoute.get("/single-user/:userId", isLoggedIn, runValidation, getSingleUser);

userRoute.get("/all-user", isLoggedIn, isAdmin, getAllUsers);

userRoute.post(
  "/process-register",
  isLoggedOut,
  singleAvatar,
  registerUserValidation,
  runValidation,
  processRegisterController
);

userRoute.post(
  "/verify",
  isLoggedOut,
  verifyUserRegistrationValidation,
  runValidation,
  verifyUserController
);

userRoute.get("/search-user", searchUser);

userRoute.get("/get-friends/:userId", isLoggedIn, getFriends);

userRoute.get("/friend-requests", isLoggedIn, getFriendRequestNotifications);

userRoute.post(
  "/send-request",
  sendFriendRequestValidation,
  runValidation,
  isLoggedIn,
  sendRequest
);

userRoute.get("/pending-requests", isLoggedIn, getPendingFriendRequests);

userRoute.put(
  "/accept-request",
  acceptFriendRequestValidation,
  runValidation,
  isLoggedIn,
  acceptRequest
);

userRoute.put("/edit-profile", singleAvatar, editProfile);

userRoute.post(
  "/forgot-password",
  isLoggedOut,
  forgotPasswordValidation,
  runValidation,
  forGotPassword
);

userRoute.put(
  "/reset-password",
  isLoggedOut,
  resetPasswordValidation,
  runValidation,
  resetPassword
);

userRoute.get("/online-users", isLoggedIn, onlineUsers);

userRoute.delete(
  "/delete-request",
  deleteFriendRequestValidation,
  runValidation,
  deleteRequest
);

export default userRoute;
