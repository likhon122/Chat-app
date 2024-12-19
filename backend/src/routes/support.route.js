import express from "express";

import { isAdmin, isLoggedIn } from "../middlewares/auth.js";
import {
  getAllTheSupportMessages,
  sendSupportMessage
} from "../controllers/support.controller.js";

const supportRoute = express.Router();

supportRoute.get(
  "/get-all-support-messages",
  isLoggedIn,
  isAdmin,
  getAllTheSupportMessages
);
supportRoute.post("/send-support-message", sendSupportMessage);

export default supportRoute;
