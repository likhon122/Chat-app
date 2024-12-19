import { faker, simpleFaker } from "@faker-js/faker";

import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import { successResponse } from "../helper/responseHandler.js";
import Message from "../models/message.model.js";

const createSingleChat = async (req, res, next) => {
  try {
    // const { numChat } = req.body;
    const users = await User.find().select("_id");

    const chatPromise = [];
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        chatPromise.push(
          Chat.create({
            chatName: faker.lorem.words(2),
            members: [users[i], users[j]],
            creator: users[i]
          })
        );
      }
    }
    await Promise.all(chatPromise);
    successResponse(res, {
      statusCode: 201,
      successMessage: "Single chat created successfully!",
      payload: chatPromise,
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const createGroupChat = async (req, res, next) => {
  try {
    const { numChat } = req.body;

    const users = await User.find().select("_id");

    const chatPromise = [];

    for (let i = 0; i < numChat; i++) {
      const numMembers = simpleFaker.number.int({ min: 3, max: users.length });
      const members = [];

      for (let j = 0; j < numMembers; j++) {
        const randomIndex = Math.floor(Math.random() * users.length);

        const randomUser = users[randomIndex];
        if (!members.includes(randomUser)) {
          members.push(randomUser);
        }
      }

      const chat = Chat.create({
        groupChat: true,
        chatName: faker.lorem.words(2),
        members,
        creator: members[0]
      });
      chatPromise.push(chat);
    }

    await Promise.all(chatPromise);

    successResponse(res, {
      statusCode: 201,
      successMessage: "Group Chat created successfully!",
      payload: chatPromise,
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const createMessages = async (req, res, next) => {
  try {
    const { numMessages } = req.body;

    const users = await User.find().select("_id");
    const chats = await Chat.find().select("_id");

    const messagesPromise = [];

    for (let i = 0; i < numMessages; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomChat = chats[Math.floor(Math.random() * chats.length)];

      messagesPromise.push(
        Message.create({
          chat: randomChat,
          sender: randomUser,
          content: faker.lorem.sentence({ min: 1, max: 5 })
        })
      );
    }
    await Promise.all(messagesPromise);

    successResponse(res, {
      statusCode: 201,
      successMessage: `New ${numMessages} messages created successfully!`,
      payload: messagesPromise,
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const createMessagesInChat = async (req, res, next) => {
  try {
    const { chatId, numMessages } = req.body;

    const users = await User.find().select("_id");

    const messagesPromise = [];

    for (let i = 0; i < numMessages; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      messagesPromise.push(
        Message.create({
          chat: chatId,
          sender: randomUser,
          content: faker.lorem.sentence()
        })
      );
    }
    await Promise.all(messagesPromise);
    successResponse(res, {
      statusCode: 201,
      successMessage: `New group ${numMessages} messages created successfully!`,
      payload: messagesPromise,
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

export {
  createSingleChat,
  createGroupChat,
  createMessages,
  createMessagesInChat
};
