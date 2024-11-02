import { errorResponse, successResponse } from "../helper/responseHandler.js";
import Support from "../models/support.model.js";

const getAllTheSupportMessages = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;

    const supportMessages = await Support.find()
      .limit(limit)
      .skip((page - 1) * limit);

    if (!supportMessages) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "No support messages found",
        nextURl: {}
      });
    }

    successResponse(res, {
      statusCode: 200,
      successMessage: "All the support messages",
      payload: supportMessages,
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const sendSupportMessage = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "Please provide all the fields",
        nextURl: {}
      });
    }

    const supportMessage = new Support({
      name,
      email,
      message
    });

    await supportMessage.save();

    successResponse(res, {
      statusCode: 201,
      successMessage:
        "Support message sent successfully!! We are reviewing it very soon as possible!!",
      payload: supportMessage,
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

export { getAllTheSupportMessages, sendSupportMessage };
