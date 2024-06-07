import express from "express";
import {
  verifyUserController,
  processRegisterController,
  getSingleUser,
  getAllUsers
} from "../controllers/user.controller.js";
import { isAdmin, isLoggedIn, isLoggedOut } from "../middlewares/auth.js";

const userRoute = express.Router();

userRoute.get("/single-user", isLoggedIn, getSingleUser);
userRoute.get("/all-user", isLoggedIn, isAdmin, getAllUsers);
userRoute.post("/process-register", isLoggedOut, processRegisterController);
userRoute.post("/verify", isLoggedOut, verifyUserController);

export default userRoute;
