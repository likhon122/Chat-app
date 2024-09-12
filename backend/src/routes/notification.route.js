import express from "express";
import {
  deleteChatNotification,
  deleteUserFromNotification,
  getChatNotification,
  makeChatNotification,
  pushNotification,
  readNotification,
  unsubscribeNotification
} from "../controllers/notification.controller.js";
import { isLoggedIn } from "../middlewares/auth.js";
import {
  deleteNotificationValidation,
  getNotificationValidation,
  notificationValidation,
  validateSubscription
} from "../validation/notificationValidation.js";
import runValidation from "../validation/runValidation.js";

const notificationRoute = express.Router();

notificationRoute.use(isLoggedIn);

notificationRoute.get(
  "/get-chat-notification",
  getNotificationValidation,
  runValidation,
  getChatNotification
);

notificationRoute.post(
  "/make-chat-notification",
  notificationValidation,
  runValidation,
  makeChatNotification
);

notificationRoute.put(
  "/read-notification",
  notificationValidation,
  runValidation,
  readNotification
);

notificationRoute.delete(
  "/delete-user-from-notification",
  notificationValidation,
  runValidation,
  deleteUserFromNotification
);

notificationRoute.delete(
  "/delete-chat-notification",
  deleteNotificationValidation,
  runValidation,
  deleteChatNotification
);

// POST route for saving a subscription
notificationRoute.post(
  "/make-push-notification",
  validateSubscription,
  runValidation,
  pushNotification
);

notificationRoute.delete("/delete-push-notification", unsubscribeNotification);

export default notificationRoute;
