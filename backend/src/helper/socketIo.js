/* eslint-disable no-await-in-loop */
import { v4 as uuid } from "uuid";

import { userSocketIds } from "../app.js";
import {
  CALL_ANSWER,
  CALL_REJECT,
  CALL_USER,
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
    socket.on(
      NEW_MESSAGE,
      async ({ chatId, members, message, replyTo = null }) => {
        let replyToMessageDetails = null;

        if (replyTo) {
          try {
            const originalMessage = await Message.findOne({
              realTimeId: replyTo
            }).populate("sender", "name avatar");

            if (originalMessage) {
              replyToMessageDetails = {
                _id: originalMessage._id,
                realTimeId: originalMessage.realTimeId,
                content: originalMessage.content,
                attachment: originalMessage.attachment,
                sender: {
                  _id: originalMessage.sender._id,
                  name: originalMessage.sender.name,
                  avatar: originalMessage.sender.avatar.url
                },
                createdAt: originalMessage.createdAt
              };
            } else {
              replyTo = null;
            }
          } catch (error) {
            console.log("Do not found any message with this realTimeId");
          }
        }

        const messageForRealTime = {
          content: message,
          replyTo: replyToMessageDetails,
          realTimeId: uuid(),
          sender: {
            _id: user._id,
            name: user.name,
            avatar: user?.avatar
          },
          chatId,
          createdAt: new Date().toISOString()
        };

        const messageForDb = {
          content: message,
          sender: user._id,
          chat: chatId,
          replyTo: replyTo ? replyTo : null,
          realTimeId: messageForRealTime.realTimeId
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
          console.error(
            "Message not saved in DB. Something went wrong!!",
            error
          );
        }
      }
    );

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

    // Call user (audio/video)
    socket.on("CALL_USER", ({ to, offer, callType, chatId }) => {
      const targetSocketId = getSockets(to);

      if (targetSocketId) {
        console.log("Emiting INCOMING_CALL event");
        io.to(targetSocketId).emit("INCOMING_CALL", {
          from: user._id,
          offer,
          callType,
          fromName: user.name,
          chatId,
          members: to
        });
      } else {
        console.warn(`User ${to} is not connected.`);
      }
    });

    // Answer call
    socket.on("ANSWER_CALL", ({ to, answer, chatId }) => {
      const memberIds = to.filter((id) => id !== user._id);
      const targetSocketId = getSockets(memberIds);

      if (targetSocketId) {
        console.log(
          `User ${user._id} answered the call from ${memberIds}. Chat ID: ${chatId}`
        );
        io.to(targetSocketId).emit("CALL_ANSWERED", { answer, chatId });
      } else {
        console.warn(`User ${memberIds} is not connected.`);
      }
    });

    // Handle ICE candidate exchange
    socket.on("ICE_CANDIDATE", ({ to, candidate }) => {
      const targetSocketId = getSockets(to);

      if (targetSocketId && candidate) {
        io.to(targetSocketId).emit("ICE_CANDIDATE", { candidate });
      } else {
        console.warn(
          `ICE candidate not sent. User ${to} not connected or invalid candidate.`
        );
      }
    });

    // Call rejection
    socket.on("REJECT_CALL", ({ to }) => {
      const targetSocketId = getSockets(to);

      if (targetSocketId) {
        console.log(`User ${user._id} rejected the call from ${to}`);
        io.to(targetSocketId).emit("CALL_REJECTED");
      } else {
        console.warn(`User ${to} is not connected. Call rejection failed.`);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      userSocketIds.delete(user._id.toString());
      console.log("User disconnected");
    });
  });
};

export { emitEvent, getSockets, handleSocketEvents };
