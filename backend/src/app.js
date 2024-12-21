/* eslint-disable no-await-in-loop */
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import { errorResponse } from "./helper/responseHandler.js";
import { socketAuthenticator } from "./middlewares/auth.js";
import adminRoute from "./routes/admin.route.js";
import { handleSocketEvents } from "./helper/socketIo.js";
import authRoute from "./routes/auth.route.js";
import chatRoute from "./routes/chat.route.js";
import notificationRoute from "./routes/notification.route.js";
import userRoute from "./routes/user.route.js";
import {
  frontendUrl1,
  frontendUrl2,
  frontendUrl3,
  frontendUrl4
} from "./secret.js";
import seedRoute from "./seeders/seed.route.js";
import supportRoute from "./routes/support.route.js";

const app = express();
const server = createServer(app);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", frontendUrl3, frontendUrl4); // Replace with your main frontend URL
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: [frontendUrl1, frontendUrl2, frontendUrl3, frontendUrl4],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("io", io);

app.use(
  cors({
    origin: [frontendUrl1, frontendUrl2, frontendUrl3, frontendUrl4],
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
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/support", supportRoute);
app.use("/api/v1/notification", notificationRoute);

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

handleSocketEvents(io);

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
        processLogin: "/api/v1/process-login",
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
