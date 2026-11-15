/* eslint-disable no-await-in-loop */
import { v4 as uuid } from "uuid";

import { userSocketIds } from "../app.js";

import {
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  REFETCH_CHATS,
  START_TYPING,
  STOP_TYPING,
  USER_ONLINE,
  USER_OFFLINE,
  ONLINE_USERS_LIST,
  MESSAGES_SEEN,
  MESSAGES_DELIVERED
} from "../constants/event.js";
import { sendNotificationToUser } from "./sendPushNotification.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";

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

    if (!user) {
      return;
    }

    const userIdStr = user._id.toString();
    userSocketIds.set(userIdStr, socket.id);

    // Update DB with isOnline and lastSeen
    User.findByIdAndUpdate(user._id, {
      isOnline: true,
      lastSeen: new Date()
    }).catch((err) => console.error("Error updating user online status:", err));

    // Send current online user IDs to the connected client
    socket.emit(ONLINE_USERS_LIST, Array.from(userSocketIds.keys()));

    // Broadcast to everyone that this user is now online
    io.emit(USER_ONLINE, {
      userId: userIdStr,
      isOnline: true,
      lastSeen: new Date().toISOString()
    });

    // Mark pending "sent" messages in this user's direct/group chats as "delivered"
    Chat.find({ members: user._id })
      .distinct("_id")
      .then(async (chatIds) => {
        if (chatIds && chatIds.length > 0) {
          await Message.updateMany(
            {
              chat: { $in: chatIds },
              sender: { $ne: user._id },
              status: "sent"
            },
            {
              $set: { status: "delivered" }
            }
          );
          io.emit(MESSAGES_DELIVERED, {
            deliveredTo: userIdStr,
            chatIds: chatIds.map((id) => id.toString())
          });
        }
      })
      .catch((err) => console.error("Error updating delivered messages:", err));

    socket.on("GET_ONLINE_USERS", () => {
      socket.emit(ONLINE_USERS_LIST, Array.from(userSocketIds.keys()));
    });

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

        // Check if other members are online
        const otherMembers = (members || []).filter(
          (m) => m.toString() !== user._id.toString()
        );
        const hasOnlineRecipient = otherMembers.some((m) =>
          userSocketIds.has(m.toString())
        );
        const deliveryStatus = hasOnlineRecipient ? "delivered" : "sent";

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
          status: deliveryStatus,
          readBy: [],
          createdAt: new Date().toISOString()
        };

        const messageForDb = {
          content: message,
          sender: user._id,
          chat: chatId,
          replyTo: replyTo ? replyTo : null,
          status: deliveryStatus,
          readBy: [],
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

    // Handle messages seen/viewed in a chat
    socket.on(MESSAGES_SEEN, async ({ chatId, members }) => {
      try {
        if (!chatId) return;

        await Message.updateMany(
          {
            chat: chatId,
            sender: { $ne: user._id },
            readBy: { $ne: user._id }
          },
          {
            $addToSet: { readBy: user._id },
            $set: { status: "seen" }
          }
        );

        const allTargetMembers = Array.from(
          new Set(
            (members || []).map((m) => (m?._id || m).toString())
          )
        ).filter((mId) => mId !== user._id.toString());

        const membersSocket = getSockets(allTargetMembers);

        io.to(membersSocket).emit(MESSAGES_SEEN, {
          chatId,
          seenBy: {
            _id: user._id.toString(),
            name: user.name,
            avatar: user.avatar?.url || user.avatar || ""
          }
        });
      } catch (err) {
        console.error("Error handling MESSAGES_SEEN:", err);
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

    // Call user (audio/video - direct & group)
    socket.on(
      "CALL_USER",
      async ({
        to,
        offer,
        callType,
        chatId,
        callerInfo,
        isGroup = false,
        chatTitle = ""
      }) => {
        const toArray = Array.isArray(to) ? to : [to];
        const callerId = user._id.toString();
        const allParticipants = Array.from(
          new Set([callerId, ...toArray.map((id) => id && id.toString())])
        ).filter(Boolean);

        const targetMemberIds = allParticipants.filter((id) => id !== callerId);

        const userSocketId = userSocketIds.get(callerId);
        const targetSocketIds = getSockets(targetMemberIds);

        // Emit the call to all valid socket IDs
        if (!targetSocketIds || !targetSocketIds.length) {
          io.to(userSocketId).emit("USER_OFFLINE", to);
          return;
        }

        io.to(targetSocketIds).emit("INCOMING_CALL", {
          from: callerId,
          offer,
          callType,
          fromName: user.name,
          chatId,
          members: allParticipants,
          callerInfo,
          isGroup: Boolean(isGroup),
          chatTitle: chatTitle || (isGroup ? "Group Call" : user.name)
        });
      }
    );

    // Answer call (direct & group)
    socket.on("ANSWER_CALL", ({ to, answer, chatId, isGroup = false }) => {
      const toArray = Array.isArray(to) ? to : [to];
      const memberIds = toArray.filter(
        (id) => id && id.toString() !== user._id.toString()
      );
      const targetSocketIds = getSockets(memberIds);

      if (targetSocketIds && targetSocketIds.length > 0) {
        io.to(targetSocketIds).emit("CALL_ANSWERED", {
          answer,
          chatId,
          from: user._id.toString(),
          fromName: user.name,
          avatar: user.avatar,
          isGroup: Boolean(isGroup)
        });
      } else {
        console.warn(`User ${memberIds} is not connected for ANSWER_CALL.`);
      }
    });

    // Handle ICE candidate exchange
    socket.on("ICE_CANDIDATE", ({ to, candidate, chatId }) => {
      const toArray = Array.isArray(to) ? to : [to];
      const memberIds = toArray.filter(
        (id) => id && id.toString() !== user._id.toString()
      );
      const targetSocketIds = getSockets(memberIds);

      if (targetSocketIds && targetSocketIds.length > 0 && candidate) {
        io.to(targetSocketIds).emit("ICE_CANDIDATE", {
          candidate,
          chatId,
          from: user._id.toString()
        });
      }
    });

    // Mesh signaling for group calls
    socket.on("GROUP_CALL_JOIN", ({ chatId, members }) => {
      const toArray = Array.isArray(members) ? members : [members];
      const memberIds = toArray.filter(
        (id) => id && id.toString() !== user._id.toString()
      );
      const targetSocketIds = getSockets(memberIds);

      if (targetSocketIds && targetSocketIds.length > 0) {
        io.to(targetSocketIds).emit("GROUP_CALL_USER_JOINED", {
          chatId,
          userId: user._id.toString(),
          userName: user.name,
          avatar: user.avatar
        });
      }
    });

    socket.on("GROUP_CALL_OFFER", ({ to, offer, chatId }) => {
      const targetSocketId = userSocketIds.get(to?.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit("GROUP_CALL_OFFER", {
          from: user._id.toString(),
          fromName: user.name,
          avatar: user.avatar,
          offer,
          chatId
        });
      }
    });

    socket.on("GROUP_CALL_ANSWER", ({ to, answer, chatId }) => {
      const targetSocketId = userSocketIds.get(to?.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit("GROUP_CALL_ANSWER", {
          from: user._id.toString(),
          fromName: user.name,
          answer,
          chatId
        });
      }
    });

    socket.on("GROUP_CALL_ICE", ({ to, candidate, chatId }) => {
      const targetSocketId = userSocketIds.get(to?.toString());
      if (targetSocketId && candidate) {
        io.to(targetSocketId).emit("GROUP_CALL_ICE", {
          from: user._id.toString(),
          candidate,
          chatId
        });
      }
    });

    socket.on("LEAVE_GROUP_CALL", ({ chatId, members }) => {
      const toArray = Array.isArray(members) ? members : [members];
      const memberIds = toArray.filter(
        (id) => id && id.toString() !== user._id.toString()
      );
      const targetSocketIds = getSockets(memberIds);

      if (targetSocketIds && targetSocketIds.length > 0) {
        io.to(targetSocketIds).emit("GROUP_CALL_USER_LEFT", {
          chatId,
          userId: user._id.toString(),
          userName: user.name
        });
      }
    });

    // Call rejection / end
    socket.on("REJECT_CALL", ({ to, chatId, isGroup = false }) => {
      const toArray = Array.isArray(to) ? to : [to];
      const memberIds = toArray.filter(
        (id) => id && id.toString() !== user._id.toString()
      );
      const targetSocketIds = getSockets(memberIds);

      if (targetSocketIds && targetSocketIds.length > 0) {
        if (isGroup) {
          io.to(targetSocketIds).emit("GROUP_CALL_USER_LEFT", {
            chatId,
            userId: user._id.toString(),
            userName: user.name
          });
        } else {
          io.to(targetSocketIds).emit("CALL_REJECTED", { chatId });
        }
      }
    });

    // Record call log to DB and broadcast to chat in real-time
    socket.on(
      "RECORD_CALL",
      async ({
        chatId,
        members = [],
        callType = "audio",
        status = "completed",
        duration = 0,
        isGroup = false
      }) => {
        try {
          const m = Math.floor(duration / 60)
            .toString()
            .padStart(2, "0");
          const s = (duration % 60).toString().padStart(2, "0");
          const formattedDuration = `${m}:${s}`;

          const typePrefix = isGroup ? "Group " : "";
          const callTypeName = callType === "video" ? "Video" : "Audio";

          let content = "";
          if (status === "completed") {
            content = `${typePrefix}${callTypeName} Call • ${formattedDuration}`;
          } else if (status === "missed") {
            content = `Missed ${typePrefix}${callTypeName} Call`;
          } else if (status === "rejected") {
            content = `Declined ${typePrefix}${callTypeName} Call`;
          } else {
            content = `${typePrefix}${callTypeName} Call (${status})`;
          }

          const realTimeId = uuid();

          const messageForRealTime = {
            content,
            callInfo: {
              callType,
              status,
              duration
            },
            chatId,
            realTimeId,
            sender: {
              _id: user._id,
              name: user.name,
              avatar: user.avatar
            },
            createdAt: new Date().toISOString()
          };

          const messageForDb = {
            content,
            callInfo: {
              callType,
              status,
              duration
            },
            sender: user._id,
            chat: chatId,
            realTimeId
          };

          const allMembers = Array.from(
            new Set([...(members || []), user._id.toString()])
          );
          const membersSocket = getSockets(allMembers);

          io.to(membersSocket).emit(NEW_MESSAGE, {
            chatId,
            message: messageForRealTime
          });

          io.to(membersSocket).emit(NEW_MESSAGE_ALERT, {
            chatId,
            sender: user._id
          });
          io.to(membersSocket).emit(REFETCH_CHATS, { chatId });

          await Message.create(messageForDb);
        } catch (error) {
          console.error("Error recording call to DB:", error);
        }
      }
    );

    // Handle disconnect
    socket.on("disconnect", () => {
      const userIdStr = user._id.toString();
      userSocketIds.delete(userIdStr);
      const lastSeen = new Date();

      User.findByIdAndUpdate(user._id, {
        isOnline: false,
        lastSeen
      }).catch((err) =>
        console.error("Error updating user offline status:", err)
      );

      io.emit(USER_OFFLINE, {
        userId: userIdStr,
        isOnline: false,
        lastSeen: lastSeen.toISOString()
      });
      console.log("User disconnected:", userIdStr);
    });
  });
};

export { emitEvent, getSockets, handleSocketEvents };
