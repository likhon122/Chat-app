import { validationResult } from "express-validator";
import { errorResponse } from "../helper/responseHandler.js";

const runValidation = (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessage = errors.errors[0];
      return errorResponse(res, {
        statusCode: 422,
        errorMessage: errorMessage.msg,
        nextURl: {}
      });
    }

    next();
  } catch (error) {
    return next(error);
  }
};

export default runValidation;
