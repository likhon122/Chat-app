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
  renameGroupChat,
  getMessages
} from "../controllers/chat.controller.js";
import { isLoggedIn } from "../middlewares/auth.js";
import { uploadSendAttachments } from "../middlewares/multer.js";
import {
  addGroupMemberValidation,
  createGroupChatValidation,
  deleteChatValidation,
  getMessagesValidation,
  leaveGroupValidation,
  removeMemberValidation,
  renameGroupChatValidation,
  sendAttachmentsValidation
} from "../validation/chatValidation.js";
import runValidation from "../validation/runValidation.js";

const chatRoute = express.Router();

chatRoute.use(isLoggedIn);

chatRoute.post(
  "/create-group",
  createGroupChatValidation,
  runValidation,
  createGroupChat
);

chatRoute.get("/my-chats", getMyChats);
chatRoute.get("/my-groups", getMyGroups);

chatRoute.put(
  "/add-group-member",
  addGroupMemberValidation,
  runValidation,
  addGroupMember
);

chatRoute.put(
  "/remove-member",
  removeMemberValidation,
  runValidation,
  removeMember
);

chatRoute.delete(
  "/leave-group/:id",
  leaveGroupValidation,
  runValidation,
  leaveGroup
);

chatRoute.post(
  "/send-attachments",
  uploadSendAttachments,
  sendAttachmentsValidation,
  runValidation,
  sendAttachments
);

chatRoute.get(
  "/message/:id",
  getMessagesValidation,
  runValidation,
  getMessages
);

// Dynamic Route
chatRoute
  .route("/:id")
  .get(getChatDetails)
  .put(renameGroupChatValidation, runValidation, renameGroupChat)
  .delete(deleteChatValidation, runValidation, deleteChat);

export default chatRoute;
