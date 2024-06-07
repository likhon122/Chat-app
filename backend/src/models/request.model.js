import mongoose from "mongoose";

const requestModel = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Sender Id is required!"]
    },
    receiver: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Receiver Id is required!"]
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accepted", "rejected"]
    }
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestModel);

export default Request;
