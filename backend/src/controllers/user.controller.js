import bcryptjs from "bcryptjs";

import { errorResponse, successResponse } from "../helper/responseHandler.js";
import User from "../models/user.model.js";
import {
  createJsonWebToken,
  verifyJsonWebToken
} from "../helper/jsonWebToken.js";
import { frontendUrl1, jsonWebTokenKey, resetPasswordKey } from "../secret.js";
import { sendEmailWithNodemailer } from "../helper/sendEmail.js";
import Request from "../models/request.model.js";
import { emitEvent } from "../helper/socketIo.js";
import { NEW_FRIEND_REQUEST, REFETCH_CHATS } from "../constants/event.js";
import Chat from "../models/chat.model.js";
import {
  deleteFilesFromCloudinary,
  uploadFilesFromCloudinary
} from "../helper/cloudinary.js";

const getSingleUser = async (req, res, next) => {
  try {
    const id = req.params.userId;

    if (!id) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "UserId is required to get a single user",
        nextURl: {
          login: "/api/v1/login"
        }
      });
    }

    const withOutObject = await User.findOne({ _id: id })
      .select({
        password: 0
      })
      .populate("friends", "name avatar");

    if (!withOutObject) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage:
          "User not found with this id. Please enter correct id. Or Register and login",
        nextURl: {
          processRegister: "/api/v1/process-register",
          login: "/api/v1/login"
        }
      });
    }
    const user = withOutObject.toObject();

    if (user.avatar && user.avatar.url) {
      user.avatar = user.avatar.url;
    }

    successResponse(res, {
      statusCode: 200,
      successMessage: "User is successfully created!",
      payload: { user },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    if (!users) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "Users not found",
        nextURl: {
          processRegister: "/api/v1/process-register",
          login: "/api/v1/login"
        }
      });
    }

    successResponse(res, {
      statusCode: 200,
      successMessage: "All users returned successfully.",
      payload: { users },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const processRegisterController = async (req, res, next) => {
  try {
    const { name, username, email, password, bio } = req.body;

    const [existUser, existUserName] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username })
    ]);

    if (existUserName) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage:
          "Username is already have anyone taken! Please select another username!",
        nextURl: {}
      });
    }
    if (existUser) {
      return errorResponse(res, {
        statusCode: 409,
        errorMessage: "User is already exist please login!",
        nextURl: {}
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const profilePic = req.file;

    let avatar = {};

    if (profilePic) {
      const file = [profilePic];
      const attachment = await uploadFilesFromCloudinary(file);
      avatar = {
        publicId: attachment[0].public_id,
        url: attachment[0].url
      };
    }

    const tokenData = {
      name,
      username,
      email,
      password: hashedPassword,
      avatar: avatar.publicId
        ? avatar
        : {
            publicId: "",
            url: ""
          }
    };

    if (bio) {
      tokenData.bio = bio;
    }

    // Create json web token
    const token = createJsonWebToken(tokenData, jsonWebTokenKey, "10m");

    // prepare to sending mail
    const emailData = {
      email,
      subject: "Account activation email",
      html: `
       <h2>Hi ${name} !</h2>
    <p>
      You trying to create an account on our chat app. You only create this
      account to verify your account. So you verify your account! Please click
      the button Verify account or click
      <a
        style="color: blue; text-decoration: underline"
        href="${frontendUrl1}/api/v1/verify/${token}"
        >Verify Account
      </a>
      this link!
    </p>
    <div style="padding: 10px 0px">
      <a
        style="
          background-color: rgba(0, 128, 0, 0.711);
          border: 1px solid rgba(0, 128, 0, 0.711);
          text-decoration: none;
          padding: 10px 10px;
          color: white;
          border-radius: 8px;
        "
        href="${frontendUrl1}/api/v1/verify/${token}"
      >
        Verify Account</a
      >
    </div>
      `
    };

    // send email with nodemailer

    await sendEmailWithNodemailer(emailData);

    return successResponse(res, {
      statusCode: 201,
      successMessage: `Please go to your email ${email} and verify your email!`,
      payload: { token },
      nextURl: {
        verifyEmail: "/api/v1/verify",
        login: "/api/v1/login"
      }
    });
  } catch (error) {
    if (error.response) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "Email send failed, please register again!",
        nextURl: {
          processRegister: "/api/v1/process-register",
          customerService: "www.friends-chat-app.netlify.app"
        }
      });
    }
    next(error);
  }
};

const verifyUserController = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "Please send valid token!",
        nextURl: {
          processRegister: "/api/v1/process-register",
          login: "/api/v1/login"
        }
      });
    }

    const userData = verifyJsonWebToken(token, jsonWebTokenKey);

    if (!userData) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "Please send valid token!",
        nextURl: {
          processRegister: "/api/v1/process-register",
          login: "/api/v1/login"
        }
      });
    }

    const existUser = await User.findOne({ email: userData.email });

    if (existUser) {
      return errorResponse(res, {
        statusCode: 409,
        errorMessage: "User is already exist please login!",
        nextURl: { login: "api/v1/login" }
      });
    }

    const createUser = new User(userData);
    await createUser.save();

    successResponse(res, {
      statusCode: 201,
      successMessage: "User is successfully created!",
      payload: {},
      nextURl: { login: "api/v1/login" }
    });
  } catch (error) {
    next(error);
  }
};

const searchUser = async (req, res, next) => {
  try {
    const searchName = req.query.name;

    const searchingUsers = await User.find({
      name: { $regex: searchName, $options: "i" }
    }).select("avatar name username");

    if (searchingUsers.length < 1) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: `Could not found any user for ${searchName} name!`,
        nextURl: {}
      });
    }

    const searchResult = searchingUsers.map(
      ({ _id, username, name, avatar }) => {
        return { _id, username, name, avatar: avatar.url };
      }
    );

    return successResponse(res, {
      statusCode: 200,
      successMessage: "Search result returned successfully!!",
      payload: [...searchResult],
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const sendRequest = async (req, res, next) => {
  try {
    const { sender, receiver } = req.body;

    const validUserCheck = await User.findById({ _id: receiver }).select(
      "friends"
    );

    if (!validUserCheck) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage:
          "Make sure you send friend request for valid person!! Please send friend request for valid person! This person is not found!!",
        nextURl: {}
      });
    }

    if (sender !== req.userId) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage:
          "Only you can send friend request for your id! Please logged in your id and send friend request!",
        nextURl: {}
      });
    }

    if (receiver === req.userId) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "You can not send friend request itself!!",
        nextURl: {}
      });
    }

    if (validUserCheck.friends.includes(sender)) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "This user is already your friend!",
        nextURl: {}
      });
    }

    const request = await Request.findOne({
      $or: [
        { sender, receiver },
        {
          sender: receiver,
          receiver: sender
        }
      ]
    });

    if (request) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "You already send friend request for this person!",
        nextURl: {}
      });
    }

    const dbMessage = {
      sender,
      receiver
    };

    await Request.create(dbMessage);

    emitEvent(req, NEW_FRIEND_REQUEST, [receiver]);

    successResponse(res, {
      statusCode: 200,
      successMessage: "Send Request successfully!!",
      payload: {},
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const getFriends = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage:
          "userId is required on params!! You don't send any userId on params!! Make sure you send userId on params!!",
        nextURl: {}
      });
    }

    const { page } = req.query || 1;

    const skip = (page - 1) * 20;

    const allFriends = await User.findOne({ _id: userId })
      .select("friends")
      .populate({
        path: "friends",
        select: "name avatar",
        options: {
          limit: 20,
          skip
        }
      });

    if (!allFriends) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage:
          "You don't have any friends! Please add any friend's and enjoy chat!!",
        nextURl: { sendFriendRequest: "/api/v1/user/send-request" }
      });
    }

    const editFriends = allFriends.friends;

    const friends = editFriends.map(({ _id, name, avatar }) => {
      return { _id, name, avatar: avatar.url };
    });

    successResponse(res, {
      statusCode: 200,
      successMessage: "All friends returned successfully!!",
      payload: { friends },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const acceptRequest = async (req, res, next) => {
  try {
    const { acceptId } = req.body;

    const requestDetails = await Request.findById(
      { _id: acceptId },
      "sender receiver status"
    );

    if (!requestDetails) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage:
          "You can accept friend request for valid person!! Please make sure this request is valid!! This friend request is not found!!",
        nextURl: {}
      });
    }

    const [senderDetails, receiverDetails, requestDeleteDetails] =
      await Promise.all([
        User.findOneAndUpdate(
          { _id: requestDetails.sender },
          { $addToSet: { friends: requestDetails.receiver } },
          { new: true, runValidators: true }
        ),
        User.findByIdAndUpdate(
          { _id: requestDetails.receiver },
          { $addToSet: { friends: requestDetails.sender } },
          { new: true, runValidators: true }
        ),
        Request.findOneAndDelete({ _id: acceptId })
      ]);

    if (!senderDetails || !receiverDetails || !requestDeleteDetails) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "Friend request accept failed! Something is wrong!!",
        nextURl: {}
      });
    }

    const members = [requestDetails.sender, requestDetails.receiver];

    console.log(senderDetails.name, receiverDetails.name);

    await Chat.create({
      members,
      chatName: `${senderDetails.name}-${receiverDetails.name}`,
      creator: senderDetails._id
    });

    emitEvent(req, REFETCH_CHATS, members);

    return successResponse(res, {
      statusCode: 200,
      successMessage: "Accept friend Request successfully!!",
      payload: {},
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const deleteRequest = async (req, res, next) => {
  try {
    const { deleteId } = req.body;

    const requestDetails = await Request.findById(
      { _id: deleteId },
      "sender receiver status"
    );

    if (!requestDetails) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage:
          "You can delete friend request for valid person!! Please make sure this request is valid!! This friend request is not found!!",
        nextURl: {}
      });
    }

    await Request.findOneAndDelete({ _id: deleteId });

    return successResponse(res, {
      statusCode: 200,
      successMessage: "Friend Request deleted successfully!!",
      payload: {},
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const getFriendRequestNotifications = async (req, res, next) => {
  try {
    const { userId } = req;

    const requests = await Request.find({ receiver: userId })
      .select("sender")
      .populate({
        path: "sender",
        select: "name avatar"
      });

    if (!requests) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "You don't have any friend request!!",
        nextURl: {}
      });
    }

    const friendRequests = requests.map(({ _id, name, sender }) => {
      return {
        _id,
        name,
        sender: {
          _id: sender._id,
          name: sender.name,
          avatar: sender.avatar.url
        }
      };
    });

    return successResponse(res, {
      statusCode: 200,
      successMessage: "Friend Request notifications returned successfully!!",
      payload: { friendRequests },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const getPendingFriendRequests = async (req, res, next) => {
  try {
    const { userId } = req;

    const pendingRequests = await Request.find({ sender: userId })
      .select("receiver")
      .populate("receiver", "avatar name");

    if (!pendingRequests) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "You don't have any pending friend request!!",
        nextURl: {}
      });
    }

    return successResponse(res, {
      statusCode: 200,
      successMessage: "Pending friend request returned successfully!!",
      payload: { pendingRequests },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const editProfile = async (req, res, next) => {
  try {
    const { name, bio, userId } = req.body;

    const profilePic = req.file;

    if ((!name && !bio && !profilePic) || !userId) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "Please send valid data to update your profile!",
        nextURl: {}
      });
    }

    const user = await User.findOne({ _id: userId });
    if (profilePic) {
      if (user.avatar.publicId) {
        await deleteFilesFromCloudinary([user.avatar.publicId]);
      }

      const file = [profilePic];
      const attachment = await uploadFilesFromCloudinary(file);

      const avatar = {
        publicId: attachment[0].public_id,
        url: attachment[0].url
      };

      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { avatar }
      )
        .select("-password")
        .lean();

      updatedUser.avatar = avatar.url;

      return successResponse(res, {
        statusCode: 200,
        successMessage: "Profile updated successfully!!",
        payload: { updatedUser },
        nextURl: {}
      });
    }

    if (name || bio) {
      if (name) {
        if (name === user.name) {
          return errorResponse(res, {
            statusCode: 400,
            errorMessage: "You can not update same name!!",
            nextURl: {}
          });
        }
        user.name = name;
      }

      if (bio) {
        if (bio === user.bio) {
          return errorResponse(res, {
            statusCode: 400,
            errorMessage: "You can not update same bio!!",
            nextURl: {}
          });
        }
        user.bio = bio;
      }

      await user.save();
      const updatedUser = user.toObject();

      delete updatedUser.password;
      updatedUser.avatar = updatedUser.avatar.url;
      return successResponse(res, {
        statusCode: 200,
        successMessage: "Profile updated successfully!!",
        payload: { updatedUser },
        nextURl: {}
      });
    }
  } catch (error) {
    next(error);
  }
};

const forGotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "User not found with this email!",
        nextURl: {}
      });
    }

    const tokenData = {
      email
    };

    const token = createJsonWebToken(tokenData, resetPasswordKey, "5m");

    const emailData = {
      email,
      subject: "Account activation email",
      html: `
       <h2>Hi ${user.name} !</h2>
    <div>
     <p>
      You trying to reset your password.
      </p>
    </div>
    <div>
   <p>
    Do not share this link with anyone. This link is only valid for 5 minutes.
   </p>
    </div>
    <div style="padding: 10px 0px">
      You can reset your password for click this link <a
        style="color: blue; text-decoration: underline"
        href="${frontendUrl1}/reset-password/${token}"
      >
        Reset Password
      </a> or click reset password button!
    </div>
    <div style="padding: 10px 0px">
      <a
        style="
          background-color: rgba(0, 128, 0, 0.711);
          border: 1px solid rgba(0, 128, 0, 0.711);
          text-decoration: none;
          padding: 10px 10px;
          color: white;
          border-radius: 8px;
        "
        href="${frontendUrl1}/reset-password/${token}"
      >
        Reset password</a
      >
    </div>
      `
    };

    await sendEmailWithNodemailer(emailData);

    return successResponse(res, {
      statusCode: 200,
      successMessage: `Please go to your email ${email} and reset your password! We send you a link to reset your password! Link is only valid for 5 minutes!`,
      // payload: { token },
      nextURl: {
        resetPassword: "/api/v1/reset-password",
        login: "/api/v1/login"
      }
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const userData = verifyJsonWebToken(token, resetPasswordKey);

    if (!userData) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage:
          "Something is wrong! Please try again! Token is not valid! Please send valid token! We think token is expired!",
        nextURl: {
          forgotPassword: "/api/v1/forgot-password",
          login: "/api/v1/login"
        }
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const user = await User.findOneAndUpdate(
      { email: userData.email },
      { password: hashedPassword }
    );

    if (!user) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage:
          "Something is wrong! Please try again! Password is not updated! Please try again!",
        nextURl: {
          forgotPassword: "/api/v1/forgot-password",
          login: "/api/v1/login"
        }
      });
    }

    return successResponse(res, {
      statusCode: 200,
      successMessage: "Password is updated successfully!",
      nextURl: {
        login: "/api/v1/login"
      }
    });
  } catch (error) {
    next(error);
  }
};

export {
  getSingleUser,
  getAllUsers,
  verifyUserController,
  processRegisterController,
  searchUser,
  sendRequest,
  acceptRequest,
  deleteRequest,
  getFriends,
  getFriendRequestNotifications,
  getPendingFriendRequests,
  editProfile,
  forGotPassword,
  resetPassword
};
