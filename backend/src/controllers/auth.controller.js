import bcryptjs from "bcryptjs";

import User from "../models/user.model.js";
import { errorResponse, successResponse } from "../helper/responseHandler.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyJsonWebToken
} from "../helper/jsonWebToken.js";
import { accessTokenKey } from "../secret.js";

const getUser = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      errorResponse(res, {
        statusCode: 401,
        errorMessage: "Access token not found please login again!",
        nextURl: {
          login: "/api/v1/login"
        }
      });
      return;
    }

    const user = verifyJsonWebToken(accessToken, accessTokenKey);

    if (!user) {
      errorResponse(res, {
        statusCode: 401,
        errorMessage: "Access token not valid please login again!",
        nextURl: {
          login: "/api/v1/login"
        }
      });
      return;
    }

    successResponse(res, {
      statusCode: 200,
      successMessage: "User logged in successfully!",
      payload: { user },
      nextURl: {}
    });
  } catch (error) {
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existUser = await User.findOne({ email });
    if (!existUser) {
      errorResponse(res, {
        statusCode: 404,
        errorMessage:
          "User is not registered with this email please register first!",
        nextURl: {
          processRegister: "/api/v1/process-register",
          verifyUser: "/api/v1/verify",
          login: "/api/v1/login"
        }
      });
    }

    const comparePassword = await bcryptjs.compare(
      password,
      existUser.password
    );
    if (!comparePassword) {
      errorResponse(res, {
        statusCode: 404,
        errorMessage: "User email or password is incorrect!",
        nextURl: {
          forgotPassword: "/api/v1/forgot-password",
          contactUs: "http://friends-chat-app.netlify.app"
        }
      });
    }
    const user = existUser.toObject();

    delete user.password;

    if (user.avatar && user.avatar.url) {
      user.avatar = user.avatar.url;
    }

    createAccessToken(res, user);
    createRefreshToken(res, user);

    successResponse(res, {
      statusCode: 200,
      successMessage: "User logged in successfully!",
      payload: { user },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const logOutUser = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken || !refreshToken) {
      errorResponse(res, {
        statusCode: 401,
        errorMessage: "You are already logged out please login first!",
        nextURl: {
          login: "/api/v1/login"
        }
      });
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });

    successResponse(res, {
      statusCode: 200,
      successMessage: "User logged out successfully!",
      payload: {},
      nextURl: { login: "/api/v1/login" }
    });
  } catch (error) {
    next(error);
  }
};

export { loginUser, logOutUser, getUser };
