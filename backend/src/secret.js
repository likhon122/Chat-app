import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL;
const mongooseUrl = process.env.MONGODB_URL;
const jsonWebTokenKey = process.env.JSON_WEB_TOKEN_KEY;
const smtpUsername = process.env.SMTP_USERNAME;
const smtpPassword = process.env.SMTP_PASSWORD;
const accessTokenKey = process.env.ACCESS_TOKEN_KEY;
const refreshTokenKey = process.env.REFRESH_TOKEN_KEY;

export {
  frontendUrl,
  port,
  mongooseUrl,
  jsonWebTokenKey,
  smtpPassword,
  smtpUsername,
  accessTokenKey,
  refreshTokenKey
};
