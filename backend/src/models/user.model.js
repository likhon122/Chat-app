import mongoose, { Mongoose } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Username is required to sign up!"]
    },
    username: {
      type: String,
      required: [true, "Username is required to sign up!"],
      unique: [
        true,
        "Username is already have anyone taken! Please select another username"
      ]
    },
    email: {
      type: String,
      unique: [true, "Email is already Exist! Please select another Email!"],
      required: [true, "User email is required to sign up!"]
    },
    password: {
      type: String,
      required: [true, "User password is required to sign up!"]
    },
    avatar: {
      publicId: {
        type: String
        // required: [true, "Avatar public id is required!"]
      },
      url: {
        type: String
        // required: [true, "Avatar url is required!"]
      }
    },
    friends: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
