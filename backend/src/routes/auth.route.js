import express from "express";

import { logOutUser, loginUser } from "../controllers/auth.controller.js";
import { isLoggedIn, isLoggedOut } from "../middlewares/auth.js";

const authRoute = express.Router();

authRoute.post("/login", isLoggedOut, loginUser);
authRoute.get("/log-out", isLoggedIn, logOutUser);

export default authRoute;
