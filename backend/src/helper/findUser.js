import User from "../models/user.model.js";
import { errorResponse } from "./responseHandler.js";

const findUserByEmail = async (res, email) => {
  try {
    const existUser = await User.findOne({ email });

    if (existUser) {
      return errorResponse(res, {
        statusCode: 409,
        errorMessage: "User is already exist please login!",
        nextURl: { login: "api/v1/login" }
      });
    }
    return existUser;
  } catch (error) {
    throw error;
  }
};

export default findUserByEmail;
