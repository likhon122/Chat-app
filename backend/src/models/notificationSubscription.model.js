// models/subscription.model.js
import mongoose from "mongoose";

const notificationSubscriptionSchema = new mongoose.Schema(
  {
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true }
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" } 
  },
  { timestamps: true }
);

const NotificationSubscriptionModel = mongoose.model(
  "NotificationSubscription",
  notificationSubscriptionSchema
);

export default NotificationSubscriptionModel;
