import { errorResponse, successResponse } from "../helper/responseHandler.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { adminLoginEmail, adminLoginPassword } from "../secret.js";

const adminLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "Email is required!!",
        nextURl: {}
      });
    }
    if (!password) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "Password is required!!",
        nextURl: {}
      });
    }

    if (email !== adminLoginEmail || password !== adminLoginPassword) {
      return errorResponse(res, {
        statusCode: 401,
        errorMessage:
          "You are not authorized to access admin panel please contact us or call use !!",
        nextURl: {
          home: "/"
        }
      });
    }

    return successResponse(res, {
      statusCode: 200,
      successMessage: "Admin login successfully!!",
      payload: {},
      nextURl: { adminPanel: "/admin-panel" }
    });
  } catch (error) {
    next(error);
  }
};

const getAllUserDetails = async (req, res, next) => {
  try {
    const page = req.params || 1;
    const limit = req.params || 20;
    const skip = (page - 1) * limit;
    const allUser = await User.find()
      .select("name avatar email friends")
      .limit(limit)
      .skip(skip);

    if (!allUser) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "Could not found any user!!",
        nextURl: {}
      });
    }

    const allUsers = await Promise.all(
      allUser.map(async ({ _id, name, email, avatar, friends }) => {
        const groupChats = await Chat.countDocuments({
          groupChat: true,
          members: _id
        });

        return {
          _id,
          name,
          email,
          avatar: avatar.url,
          friends: friends.length,
          groupChats: groupChats || 0
        };
      })
    );

    return successResponse(res, {
      statusCode: 200,
      successMessage: "All user details returned successfully!!",
      payload: { allUsers },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const getAllMessages = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    const allMessage = await Message.find()
      .limit(limit)
      .skip(skip)
      .populate("sender", "name avatar")
      .populate("chat", "groupChat");

    const allMessages = await Promise.all(
      allMessage.map(
        async ({
          _id,
          sender: senderDetails,
          content,
          chat,
          attachment,
          createdAt
        }) => {
          const sender = {
            _id: senderDetails._id,
            name: senderDetails.name,
            avatar: senderDetails.avatar.url
          };

          return {
            _id,
            attachment,
            content,
            sender,
            chatDetails: chat ? chat : {},
            createdAt
          };
        }
      )
    );

    return successResponse(res, {
      statusCode: 200,
      successMessage: "All messages returned successfully!!",
      payload: { allMessages },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const getAllChats = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    const chats = await Chat.find()
      .limit(limit)
      .skip(skip)
      .populate("creator", "name avatar")
      .populate("members", "avatar");

    const chatDetails = chats.map(
      ({ _id, chatName, groupChat, creator, members }) => {
        const membersUrl = members
          .slice(0, 3)
          .map((avatar) => avatar.avatar.url);

        return {
          _id,
          chatName,
          groupChat,
          creator: {
            _id: creator?._id || "",
            name: creator?.name || "none",
            avatar: creator?.avatar.url || ""
          },
          membersPhotoUrl: membersUrl
        };
      }
    );
    return successResponse(res, {
      statusCode: 200,
      successMessage: "All chats returned successfully!!",
      payload: { chatDetails },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const getDashBoardStatus = async (req, res, next) => {
  try {
    const [totalUser, totalChat, totalGroupChat, totalMessage] =
      await Promise.all([
        User.countDocuments(),
        Chat.countDocuments(),
        Chat.countDocuments({ groupChat: true }),
        Message.countDocuments()
      ]);

    const totalSingleChat = totalChat - totalGroupChat;

    const today = new Date();
    const last7DayDate = new Date();
    last7DayDate.setDate(today.getDate() - 7);

    const last7DaysMessages = await Message.find({
      createdAt: {
        $gte: last7DayDate,
        $lte: today
      }
    }).select("createdAt");

    if (!last7DaysMessages) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage:
          "Could not found last 7 day messages!! No one message etch other last 7 days!!",
        nextURl: {}
      });
    }

    const last7DaysMessagesCount = new Array(7).fill(0);
    const dayInMillisecond = 86400000;

    last7DaysMessages.forEach((message) => {
      const messageCurrentIndex = Math.floor(
        (today.getTime() - message.createdAt) / dayInMillisecond
      );
      // eslint-disable-next-line no-plusplus
      last7DaysMessagesCount[6 - messageCurrentIndex]++;
    });

    const dashBoardDetails = {
      totalUser,
      totalChat,
      totalGroupChat,
      totalSingleChat,
      last7DaysMessagesCount
    };

    return successResponse(res, {
      statusCode: 200,
      successMessage: "Dashboard details returned successfully!!",
      payload: { dashBoardDetails },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAllUserDetails,
  getAllMessages,
  getAllChats,
  getDashBoardStatus,
  adminLogin
};
