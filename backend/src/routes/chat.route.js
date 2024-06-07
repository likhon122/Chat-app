import express from "express";
import {
  getMyChats,
  getMyGroups,
  createGroupChat,
  addGroupMember,
  removeMember,
  leaveGroup,
  // deleteChat
} from "../controllers/chat.controller.js";
import { isLoggedIn } from "../middlewares/auth.js";

const chatRoute = express.Router();

chatRoute.use(isLoggedIn);
chatRoute.post("/new", createGroupChat);
chatRoute.get("/my-chats", getMyChats);
chatRoute.get("/my-groups", getMyGroups);
chatRoute.put("/add-group-member", addGroupMember);
chatRoute.put("/remove-member", removeMember);
chatRoute.delete("/leave-group/:id", leaveGroup);
// chatRoute.delete("delete-chat/:id", deleteChat);

export default chatRoute;
