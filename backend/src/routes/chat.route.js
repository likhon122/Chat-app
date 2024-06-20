import express from "express";

import {
  getMyChats,
  getMyGroups,
  createGroupChat,
  addGroupMember,
  removeMember,
  leaveGroup,
  deleteChat,
  sendAttachments,
  getChatDetails,
  renameGroupChat
} from "../controllers/chat.controller.js";
import { isLoggedIn } from "../middlewares/auth.js";
import { uploadSendAttachments } from "../middlewares/multer.js";

const chatRoute = express.Router();

chatRoute.use(isLoggedIn);
chatRoute.post("/new", createGroupChat);
chatRoute.get("/my-chats", getMyChats);
chatRoute.get("/my-groups", getMyGroups);
chatRoute.put("/add-group-member", addGroupMember);
chatRoute.put("/remove-member", removeMember);
chatRoute.delete("/leave-group/:id", leaveGroup);
chatRoute.post("/send-attachments", uploadSendAttachments, sendAttachments);

// Dynamic Route
chatRoute
  .route("/:id")
  .get(getChatDetails)
  .put(renameGroupChat)
  .delete(deleteChat);

export default chatRoute;
