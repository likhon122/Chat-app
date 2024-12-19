import express from "express";
import seedUser from "./seedUser.js";
import { isAdmin, isLoggedIn } from "../middlewares/auth.js";
import {
  createGroupChat,
  createMessages,
  createMessagesInChat,
  createSingleChat
} from "./seedChat.js";

const seedRoute = express.Router();

seedRoute.get("/seed-user", seedUser);
seedRoute.post("/create-single-chat", isLoggedIn, isAdmin, createSingleChat);
seedRoute.post("/create-group-chat", isLoggedIn, isAdmin, createGroupChat);
seedRoute.post("/create-messages", isLoggedIn, isAdmin, createMessages);
seedRoute.post(
  "/create-messages-in-groupChat",
  isLoggedIn,
  isAdmin,
  createMessagesInChat
);

export default seedRoute;
