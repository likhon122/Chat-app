import express from "express";
import {
  pushNotification,
  unsubscribeNotification,
  validateSubscription
} from "../controllers/notification.controller.js";

const notificationRoute = express.Router();

// POST route for saving a subscription
notificationRoute.post("/", validateSubscription, pushNotification);

// DELETE route for unsubscribing
notificationRoute.delete("/", unsubscribeNotification);

export default notificationRoute;
