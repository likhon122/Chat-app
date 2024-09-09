/* eslint-disable no-await-in-loop */
import { userSocketIds } from "../app.js";
import { sendNotificationToUser } from "./sendPushNotification.js";

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

export { emitEvent, getSockets };
