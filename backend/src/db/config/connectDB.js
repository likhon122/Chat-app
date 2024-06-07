import mongoose from "mongoose";
import { mongooseUrl } from "../../secret.js";

const connectDB = async () => {
  try {
    await mongoose.connect(mongooseUrl);
    console.log("Database is connected successfully");
  } catch (error) {
    console.log("Database is not connected!", error);
    process.exit(1);
  }
};

export default connectDB;
