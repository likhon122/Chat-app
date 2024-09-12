/* eslint-disable no-await-in-loop */
import { v4 as uuid } from "uuid";

import { userSocketIds } from "../app.js";
import {
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  REFETCH_CHATS,
  START_TYPING,
  STOP_TYPING
} from "../constants/event.js";
import { sendNotificationToUser } from "./sendPushNotification.js";
import Message from "../models/message.model.js";

const getSockets = (members = []) => {
  const sockets =
    members &&
    members.length > 0 &&
    members.map((member) => {
      const socketId = userSocketIds.get(member.toString());
      return socketId;
    });

  return (
    sockets &&
    sockets.length > 0 &&
    sockets.filter((socketId) => socketId !== undefined)
  );
};

const emitEvent = (req, event, users, data = "") => {
  const io = req.app.get("io");

  const membersSocket = getSockets(users);

  io.to(membersSocket).emit(event, data);
};

const handleSocketEvents = (io) => {
  io.on("connection", (socket) => {
    const { user } = socket;
    userSocketIds.set(user._id.toString(), socket.id);

    // Handle new message
    socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
      const messageForRealTime = {
        content: message,
        _id: uuid(),
        sender: {
          _id: user._id,
          name: user.name,
          avatar: user?.avatar?.url
        },
        chatId,
        createdAt: new Date().toISOString()
      };

      const messageForDb = {
        content: message,
        sender: user._id,
        chat: chatId
      };

      const membersSocket = getSockets(members);

      // Emit message in real-time
      io.to(membersSocket).emit(NEW_MESSAGE, {
        chatId,
        message: messageForRealTime
      });

      io.to(membersSocket).emit(NEW_MESSAGE_ALERT, {
        chatId,
        sender: user._id
      });
      io.to(membersSocket).emit(REFETCH_CHATS, { chatId });

      try {
        const resMessage = await Message.create(messageForDb);
        if (!resMessage) {
          console.error("Message not saved in DB. Something went wrong!!");
        } else {
          // Send push notification to offline members
          for (const member of members) {
            if (!userSocketIds.has(member.toString())) {
              await sendNotificationToUser({
                content: message,
                sender: user._id,
                chat: chatId,
                member
              });
            }
          }
        }
      } catch (error) {
        console.error("Message not saved in DB. Something went wrong!!", error);
      }
    });

    // Handle typing events
    socket.on(START_TYPING, async ({ members, chatId }) => {
      const membersSocket = getSockets(members);
      socket.to(membersSocket).emit(START_TYPING, { chatId });
    });

    // Handle stop typing events
    socket.on(STOP_TYPING, async ({ members, chatId }) => {
      const membersSocket = getSockets(members);
      socket.to(membersSocket).emit(STOP_TYPING, { chatId });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      userSocketIds.delete(user._id.toString());
      console.log("User disconnected");
    });
  });
};

export { emitEvent, getSockets, handleSocketEvents };
