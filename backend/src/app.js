import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http";

import { frontendUrl } from "./secret.js";
import seedRoute from "./seeders/seed.route.js";
import userRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";
import chatRoute from "./routes/chat.route.js";
import { errorResponse } from "./helper/responseHandler.js";

const app = express();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true
  }
});

app.use(
  cors({
    origin: [frontendUrl],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Seeding route it's don't use on production !!!!!!!!!!!!!!
app.use("/api/v1/seed", seedRoute);

// Set all Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/chat", chatRoute);

// Socket io setup
io.on("connection", (socket) => {
  console.log(`User connected ${socket.id}`);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Fallback route for handling 404 errors
app.use((req, res, next) => {
  res.status(404).json({
    statusCode: 404,
    message: "Not Found"
  });
});

// Handle all internal server errors
app.use((err, req, res, next) => {
  if (err.kind === "ObjectId") {
    const errorMessage = `Wrong object id path:${err.path}, errorId:${err.value._id}, Please provide correct objectId!!`;
    errorResponse(res, {
      statusCode: 400,
      errorMessage,
      nextURl: {}
    });
  }

  if (err.code === 11000) {
    errorResponse(res, {
      statusCode: 422,
      errorMessage: `Duplicate key error email or username must be unique!! ${Object.keys(err.keyPattern)[0]} is duplicate!! Please select another username!!`,
      nextURl: {
        processRegister: "/api/v1/process-register",
        customerService: "www.friends-chat-app.netlify.app"
      }
    });
  }
  res.status(err.status || 500).json({
    statusCode: err.status || 500,
    message: err.message || "Internal Server Error"
  });
});

export default server;
