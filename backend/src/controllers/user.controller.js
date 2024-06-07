import bcryptjs from "bcryptjs";

import { errorResponse, successResponse } from "../helper/responseHandler.js";
import User from "../models/user.model.js";
import {
  createJsonWebToken,
  verifyJsonWebToken
} from "../helper/jsonWebToken.js";
import { frontendUrl, jsonWebTokenKey } from "../secret.js";
import { sendEmailWithNodemailer } from "../helper/sendEmail.js";

const getSingleUser = async (req, res, next) => {
  try {
    const { id } = req.body;

    if (!id) {
      errorResponse(res, {
        statusCode: 400,
        errorMessage: "userId is required to get a single user",
        nextURl: {
          login: "/api/v1/login"
        }
      });
    }

    const user = await User.findOne({ _id: id }).select({
      password: 0
    });

    if (!user) {
      errorResponse(res, {
        statusCode: 404,
        errorMessage:
          "User not found with this id. Please enter correct id. Or Register and login",
        nextURl: {
          processRegister: "/api/v1/process-register",
          login: "/api/v1/login"
        }
      });
    }

    successResponse(res, {
      statusCode: 200,
      successMessage: "User is successfully created!",
      payload: { user },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    if (!users) {
      errorResponse(res, {
        statusCode: 404,
        errorMessage: "Users not found",
        nextURl: {
          processRegister: "/api/v1/process-register",
          login: "/api/v1/login"
        }
      });
    }

    successResponse(res, {
      statusCode: 200,
      successMessage: "All users returned successfully.",
      payload: { users },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const processRegisterController = async (req, res, next) => {
  try {
    const { name, email, password, profilePic } = req.body;

    const existUser = await User.findOne({ email });

    if (existUser) {
      errorResponse(res, {
        statusCode: 409,
        errorMessage: "User is already exist please login!",
        nextURl: { login: "/api/v1/login" }
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const tokenData = { name, email, password: hashedPassword, profilePic };

    // Create json web token
    const token = createJsonWebToken(tokenData, jsonWebTokenKey, "10m");

    // prepare to sending mail
    const emailData = {
      email,
      subject: "Account activation email",
      html: `
       <h2>Hi ${name} !</h2>
    <p>
      You trying to create an account on our chat app. You only create this
      account to verify your account. So you verify your account! Please click
      the button Verify account or click
      <a
        style="color: blue; text-decoration: underline"
        href="${frontendUrl}/api/v1/verify/${token}"
        >Verify Account
      </a>
      this link!
    </p>
    <div style="padding: 10px 0px">
      <a
        style="
          background-color: rgba(0, 128, 0, 0.711);
          border: 1px solid rgba(0, 128, 0, 0.711);
          text-decoration: none;
          padding: 10px 10px;
          color: white;
          border-radius: 8px;
        "
        href="${frontendUrl}/api/v1/verify/${token}"
      >
        Verify Account</a
      >
    </div>
      `
    };

    // send email with nodemailer

    await sendEmailWithNodemailer(emailData);

    successResponse(res, {
      statusCode: 201,
      successMessage: `Please go to your email ${email} and verify your email!`,
      payload: { token },
      // payload:{},
      nextURl: {
        verifyEmail: "/api/v1/verify",
        login: "/api/v1/login"
      }
    });
  } catch (error) {
    if (error.response) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "Email send failed, please register again!",
        nextURl: {
          processRegister: "/api/v1/process-register",
          customerService: "www.friends-chat-app.netlify.app"
        }
      });
    }
    next(error);
  }
};

const verifyUserController = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      errorResponse(res, {
        statusCode: 400,
        errorMessage: "Please send valid token!",
        nextURl: {
          processRegister: "/api/v1/process-register",
          login: "/api/v1/login"
        }
      });
    }

    const userData = verifyJsonWebToken(token, jsonWebTokenKey);

    if (!userData) {
      errorResponse(res, {
        statusCode: 400,
        errorMessage: "Please send valid token!",
        nextURl: {
          processRegister: "/api/v1/process-register",
          login: "/api/v1/login"
        }
      });
    }

    const existUser = await User.findOne({ email: userData.email });

    if (existUser) {
      errorResponse(res, {
        statusCode: 409,
        errorMessage: "User is already exist please login!",
        nextURl: { login: "api/v1/login" }
      });
    }

    const createUser = new User(userData);
    await createUser.save();

    successResponse(res, {
      statusCode: 201,
      successMessage: "User is successfully created!",
      payload: {},
      nextURl: { login: "api/v1/login" }
    });
  } catch (error) {
    next(error);
  }
};

export {
  getSingleUser,
  getAllUsers,
  verifyUserController,
  processRegisterController
};
