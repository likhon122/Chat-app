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
const adminLoginPath = process.env.ADMIN_LOGIN_PATH;
const adminLoginPassword = process.env.ADMIN_LOGIN_PASSWORD;
const adminLoginEmail = process.env.ADMIN_LOGIN_EMAIL;
const resetPasswordKey = process.env.RESET_PASSWORD_KEY;
const frontendUrl4 = process.env.FRONTEND_URL4;

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
  pushNotificationPublicKey,
  adminLoginPath,
  adminLoginPassword,
  adminLoginEmail,
  resetPasswordKey,
  frontendUrl4
};
