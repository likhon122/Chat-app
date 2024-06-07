import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { frontendUrl } from "./secret.js";
import seedRoute from "./seeders/seed.route.js";
import userRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";
import chatRoute from "./routes/chat.route.js";

const app = express();

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

// Fallback route for handling 404 errors
app.use((req, res, next) => {
  res.status(404).json({
    statusCode: 404,
    message: "Not Found"
  });
});

// Handle all internal server errors
app.use((err, req, res, next) => {
  console.dir(err);
  res.status(err.status || 500).json({
    statusCode: err.status || 500,
    message: err.message || "Internal Server Error"
  });
});

export default app;
