import express from "express";
import { isAdmin, isLoggedIn } from "../middlewares/auth.js";
import {
  getAllChats,
  getAllMessages,
  getAllUserDetails,
  getDashBoardStatus
} from "../controllers/admin.controller.js";

const adminRoute = express.Router();

adminRoute.use(isLoggedIn, isAdmin);

adminRoute.get("/get-all-users", getAllUserDetails);

adminRoute.get("/get-all-messages", getAllMessages);

adminRoute.get("/get-all-chats", getAllChats);
adminRoute.get("/get-dashboard-status", getDashBoardStatus);

export default adminRoute;
