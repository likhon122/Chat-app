import mongoose from "mongoose";

const messageModel = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Sender Id is required!"]
    },
    content: {
      type: String
      // required: [true, "Content is required!"]
    },
    attachment: [
      {
        public_id: {
          type: String,
          required: [true, "Public id is required!"]
        },
        url: {
          type: String,
          required: [true, "Url is required!"]
        }
      }
    ],
    chat: {
      type: mongoose.Types.ObjectId,
      ref: "Chat",
      required: [true, "Chat is required!"]
    },
    replyTo: {
      type: String,
      default: null
    },
    realTimeId: {
      type: String,
      required: [true, "Real time id is required!"]
    }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageModel);

export default Message;
