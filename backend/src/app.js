import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http";
import { v4 as uuid } from "uuid";

import { frontendUrl1, frontendUrl2, frontendUrl3 } from "./secret.js";
import seedRoute from "./seeders/seed.route.js";
import userRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";
import chatRoute from "./routes/chat.route.js";
import { errorResponse } from "./helper/responseHandler.js";
import {
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  START_TYPING,
  STOP_TYPING
} from "./constants/event.js";
import { getSockets } from "./helper/socketIo.js";
import Message from "./models/message.model.js";
import { socketAuthenticator } from "./middlewares/auth.js";

const app = express();
const server = createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: [frontendUrl1, frontendUrl2, frontendUrl3],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("io", io);

app.use(
  cors({
    origin: [frontendUrl1, frontendUrl2, frontendUrl3],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get("/api/v1/health", (_, res) => {
  return res.status(200).send({
    message: "Server is running good!!"
  });
});

app.use("/api/v1/seed", seedRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/chat", chatRoute);

// Socket.io Authentication Middleware
io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, async (err) => {
    if (err) {
      return next(err);
    }
    await socketAuthenticator(socket, next);
  });
});

// Map for storing user socket IDs
export const userSocketIds = new Map();

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

    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

    try {
      const resMessage = await Message.create(messageForDb);
      if (!resMessage) {
        console.error("Message not saved in DB. Something went wrong!!");
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

  socket.on(STOP_TYPING, async ({ members, chatId }) => {
    const membersSocket = getSockets(members);
    socket.to(membersSocket).emit(STOP_TYPING, { chatId });
  });

  socket.on("disconnect", () => {
    userSocketIds.delete(user._id.toString());
    console.log("User disconnected");
  });
});

// 404 Handler
app.use((req, res) => {
  return res.status(404).json({
    statusCode: 404,
    message: "Not Found"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err); 
  }

  if (err.kind === "ObjectId") {
    const errorMessage = `Invalid object ID: ${err.path}. Please provide a valid object ID.`;
    return errorResponse(res, {
      statusCode: 400,
      errorMessage
    });
  }

  if (err.code === 11000) {
    return errorResponse(res, {
      statusCode: 422,
      errorMessage: `Duplicate key error: ${Object.keys(err.keyPattern)[0]} is already in use. Please use another value.`,
      nextURl: {
        processRegister: "/api/v1/process-register",
        customerService: "www.friends-chat-app.netlify.app"
      }
    });
  }

  return res.status(err.status || 500).json({
    statusCode: err.status || 500,
    message: err.message || "Internal Server Error"
  });
});

export default server;
