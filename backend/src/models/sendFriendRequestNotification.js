import mongoose from "mongoose";

const sendFriendRequestNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [
        true,
        "User id is required to save friend request notification"
      ]
    },
    count: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const SendFriendRequestNotification = mongoose.model(
  "sendFriendRequestNotification",
  sendFriendRequestNotificationSchema
);

export default SendFriendRequestNotification;
