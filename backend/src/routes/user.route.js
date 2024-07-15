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
  getFriendRequestNotifications
} from "../controllers/user.controller.js";
import { isAdmin, isLoggedIn, isLoggedOut } from "../middlewares/auth.js";
import {
  acceptFriendRequestValidation,
  deleteFriendRequestValidation,
  getSingleUserValidation,
  registerUserValidation,
  sendFriendRequestValidation,
  verifyUserRegistrationValidation
} from "../validation/userValidation.js";
import runValidation from "../validation/runValidation.js";

const userRoute = express.Router();

userRoute.get(
  "/single-user",
  isLoggedIn,
  getSingleUserValidation,
  runValidation,
  getSingleUser
);

userRoute.get("/all-user", isLoggedIn, isAdmin, getAllUsers);

userRoute.post(
  "/process-register",
  isLoggedOut,
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

userRoute.get("/get-friends", isLoggedIn, getFriends);

userRoute.get("/friend-requests", isLoggedIn, getFriendRequestNotifications);

userRoute.post(
  "/send-request",
  sendFriendRequestValidation,
  runValidation,
  isLoggedIn,
  sendRequest
);

userRoute.put(
  "/accept-request",
  acceptFriendRequestValidation,
  runValidation,
  isLoggedIn,
  acceptRequest
);

userRoute.delete(
  "/delete-request",
  deleteFriendRequestValidation,
  runValidation,
  deleteRequest
);

export default userRoute;
