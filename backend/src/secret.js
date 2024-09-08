import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 3000;
const frontendUrl1 = process.env.FRONTEND_URL1;
const frontendUrl2 = process.env.FRONTEND_URL2;
const frontendUrl3 = process.env.FRONTEND_URL3;
const mongooseUrl = process.env.MONGODB_URL;
const jsonWebTokenKey = process.env.JSON_WEB_TOKEN_KEY;
const smtpUsername = process.env.SMTP_USERNAME;
const smtpPassword = process.env.SMTP_PASSWORD;
const accessTokenKey = process.env.ACCESS_TOKEN_KEY;
const refreshTokenKey = process.env.REFRESH_TOKEN_KEY;
const pushNotificationPublicKey = process.env.PUBLIC_VAPID_KEY;
const pushNotificationPrivateKey = process.env.PRIVATE_VAPID_KEY;

export {
  frontendUrl1,
  frontendUrl2,
  frontendUrl3,
  port,
  mongooseUrl,
  jsonWebTokenKey,
  smtpPassword,
  smtpUsername,
  accessTokenKey,
  refreshTokenKey,
  pushNotificationPrivateKey,
  pushNotificationPublicKey
};
