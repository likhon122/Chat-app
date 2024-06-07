import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    chatName: {
      type: String,
      required: [true, "Chat name is required!"]
    },
    groupChat: {
      type: Boolean,
      default: false
    },
    creator: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Creator id is required!"]
    },
    members: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: [true, "Member id is required!"]
      }
    ]
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
