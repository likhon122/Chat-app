import jwt from "jsonwebtoken";
import { accessTokenKey, refreshTokenKey } from "../secret.js";

const createJsonWebToken = (tokenData, secretKey, expireTime) => {
  if (typeof tokenData !== "object") {
    throw new Error("Token Data is must be an object!");
  }
  if (typeof secretKey !== "string") {
    throw new Error("Token secretKey is must be a string value!");
  }
  if (typeof expireTime !== "string") {
    throw new Error("Token Expire time must be a string!");
  }

  try {
    const token = jwt.sign(tokenData, secretKey, {
      expiresIn: expireTime
    });
    return token;
  } catch (error) {
    throw Error(error);
  }
};

const verifyJsonWebToken = (token, jwtSecretKey) => {
  try {
    const data = jwt.verify(token, jwtSecretKey);
    if (data) {
      return data;
    }
    throw Error("Token verify not successful");
  } catch (error) {
    throw error;
  }
};

const createAccessToken = (res, user) => {
  try {
    const accessToken = jwt.sign(user, accessTokenKey, { expiresIn: "1d" });
    res.cookie("accessToken", accessToken, {
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      httpOnly: true,
      sameSite: "none"
    });
  } catch (error) {
    throw error;
  }
};

const createRefreshToken = (res, user) => {
  try {
    const refreshToken = jwt.sign(user, refreshTokenKey, { expiresIn: "15d" });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      secure: true,
      httpOnly: true,
      sameSite: "none"
    });
  } catch (error) {
    throw error;
  }
};

export {
  createJsonWebToken,
  verifyJsonWebToken,
  createAccessToken,
  createRefreshToken
};
