import { validationResult } from "express-validator";
import NotificationSubscriptionModel from "../models/notificationSubscription.model.js";
import { errorResponse, successResponse } from "../helper/responseHandler.js";
import ChatNotification from "../models/chatNotification.model.js";

// Middleware for validating subscription data

const pushNotification = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { endpoint, keys, userId } = req.body;

    const existingSubscription = await NotificationSubscriptionModel.findOne({
      endpoint
    });

    if (existingSubscription) {
      // Update the existing subscription with new keys or userId if needed
      existingSubscription.keys = keys;
      existingSubscription.userId = userId;
      await existingSubscription.save();

      return res
        .status(200)
        .json({ message: "Subscription updated successfully" });
    }

    const subscription = new NotificationSubscriptionModel({
      endpoint,
      keys,
      userId
    });
    await subscription.save();

    res.status(201).json({ message: "Subscription saved successfully" });
  } catch (error) {
    next(error);
  }
};

const unsubscribeNotification = async (req, res, next) => {
  const { endpoint } = req.body;

  try {
    const result = await NotificationSubscriptionModel.deleteOne({ endpoint });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    next(error);
  }
};

const getChatNotification = async (req, res, next) => {
  try {
    const { userId } = req.query;

    const chatNotifications = await ChatNotification.find({
      users: userId
    }).select("chat countPerUser");

    if (!chatNotifications) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "No chat notification found",
        nextURl: {}
      });
    }

    const chatNotification = [];

    chatNotifications.forEach((notification) => {
      const count = notification.countPerUser.get(userId);

      if (count) {
        const chatNotifi = {
          chatId: notification.chat,
          userId,
          count
        };

        chatNotification.push(chatNotifi);
      }
    });

    return successResponse(res, {
      statusCode: 200,
      successMessage: "Chat notification fetched successfully",
      payload: chatNotification,
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const makeChatNotification = async (req, res, next) => {
  try {
    const { chatId, userId } = req.body;

    const chatNotification = await ChatNotification.findOne({ chat: chatId });

    if (!chatNotification) {
      const newChatNotification = await ChatNotification.create({
        chat: chatId,
        users: [userId],
        countPerUser: { [userId]: 1 }
      });
      return successResponse(res, {
        statusCode: 201,
        successMessage: "Chat notification created successfully",
        payload: newChatNotification,
        nextURl: {}
      });
    }

    if (chatNotification.users.includes(userId)) {
      chatNotification.countPerUser.set(
        userId,
        chatNotification.countPerUser.get(userId) + 1
      );
    } else {
      chatNotification.users.push(userId);
      chatNotification.countPerUser.set(userId, 1);
    }

    const newChatNotification = await chatNotification.save();



    successResponse(res, {
      statusCode: 201,
      successMessage: "Chat notification created successfully",
      payload: newChatNotification,
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const readNotification = async (req, res, next) => {
  try {
    const { chatId, userId } = req.body;

    const chatNotification = await ChatNotification.findOne({ chat: chatId });

    if (!chatNotification) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "Chat notification not found",
        nextURl: {}
      });
    }

    if (chatNotification.users.includes(userId)) {
      chatNotification.countPerUser.set(userId, 0);
    }

    const newChatNotification = await chatNotification.save();

    return successResponse(res, {
      statusCode: 200,
      successMessage: "Chat notification updated successfully",
      payload: newChatNotification,
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const deleteUserFromNotification = async (req, res, next) => {
  try {
    const { chatId, userId } = req.body;

    const chatNotification = await ChatNotification.findOne({ chat: chatId });

    if (!chatNotification) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "Chat notification not found",
        nextURl: {}
      });
    }

    if (!chatNotification.users.includes(userId.toString())) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "User not found in chat notification",
        nextURl: {}
      });
    }

    chatNotification.users = chatNotification.users.filter(
      (user) => user.toString() !== userId.toString()
    );

    chatNotification.countPerUser.delete(userId);
    const newChatNotification = await chatNotification.save();
    return successResponse(res, {
      statusCode: 200,
      successMessage: "User deleted from chat notification",
      payload: newChatNotification,
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const deleteChatNotification = async (req, res, next) => {
  try {
    const { chatId } = req.body;

    const chatNotification = await ChatNotification.findOneAndDelete({
      chat: chatId
    });

    if (!chatNotification) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "Chat notification not found",
        nextURl: {}
      });
    }

    return successResponse(res, {
      statusCode: 200,
      successMessage: "Chat notification deleted successfully",
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

export {
  pushNotification,
  unsubscribeNotification,
  getChatNotification,
  makeChatNotification,
  readNotification,
  deleteUserFromNotification,
  deleteChatNotification
};
