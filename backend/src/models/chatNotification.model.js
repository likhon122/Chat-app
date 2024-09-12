import mongoose from "mongoose";

const chatNotificationModel = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "User is required to set notification!"]
      }
    ],
    chat: {
      type: mongoose.Schema.ObjectId,
      ref: "Chat",
      required: [true, "Chat is required to set notification!"]
    },
    countPerUser: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  { timestamps: true }
);

const ChatNotification = mongoose.model(
  "ChatNotification",
  chatNotificationModel
);

export default ChatNotification;
