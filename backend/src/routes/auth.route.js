import express from "express";

import { logOutUser, loginUser } from "../controllers/auth.controller.js";
import { isLoggedIn, isLoggedOut } from "../middlewares/auth.js";
import { loginVerification } from "../validation/authValidation.js";
import runValidation from "../validation/runValidation.js";

const authRoute = express.Router();

authRoute.post(
  "/login",
  loginVerification,
  runValidation,
  isLoggedOut,
  loginUser
);
authRoute.get("/log-out", isLoggedIn, logOutUser);

export default authRoute;
