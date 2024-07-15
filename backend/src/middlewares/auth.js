import { verifyJsonWebToken } from "../helper/jsonWebToken.js";
import { errorResponse } from "../helper/responseHandler.js";
import User from "../models/user.model.js";
import { accessTokenKey } from "../secret.js";

const isLoggedIn = async (req, res, next) => {
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
    const userInfo = verifyJsonWebToken(accessToken, accessTokenKey);
    if (!userInfo) {
      errorResponse(res, {
        statusCode: 401,
        errorMessage: "Access token not valid please login again!",
        nextURl: {
          login: "/api/v1/login"
        }
      });
      return;
    }
    req.userId = userInfo._id;
    next();
  } catch (error) {
    return next(error);
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const { userId } = req;


    if (!userId) {
      errorResponse(res, {
        statusCode: 404,
        errorMessage: "User not found with access token please login again",
        nextURl: {
          login: "/api/v1/login"
        }
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user.isAdmin) {
      errorResponse(res, {
        statusCode: 401,
        errorMessage: "You are not admin please go back!!",
        nextURl: {}
      });
      return;
    }
    next();
  } catch (error) {
    return next(error);
  }
};

const isLoggedOut = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;

    if (accessToken) {
      const userInfo = verifyJsonWebToken(accessToken, accessTokenKey);
      if (userInfo) {
        errorResponse(res, {
          statusCode: 401,
          errorMessage: "You are already Logged In please logOut first!",
          nextURl: {
            logOut: "/api/v1/log-out"
          }
        });
        return;
      }
    }

    next();
  } catch (error) {
    return next(error);
  }
};

// const isAuthenticated = async (req, res, next) => {
//   try {
//     const { accessToken } = req.cookies;
//     if (!accessToken) {
//       errorResponse(res, {
//         statusCode: 401,
//         errorMessage: "Access token not found please login again!",
//         nextURl: {
//           login: "/api/v1/login",
//           register: "/api/v1/process-register"
//         }
//       });
//       return;
//     }
//     const userInfo = verifyJsonWebToken(accessToken, accessTokenKey);
//     req.user = userInfo;
//     if (!userInfo) {
//       errorResponse(res, {
//         statusCode: 401,
//         errorMessage: "Access token not valid please login again!",
//         nextURl: {
//           login: "/api/v1/login",
//           register: "/api/v1/process-register"
//         }
//       });
//       // return;
//     }
//   } catch (error) {}
// };

export { isLoggedIn, isAdmin, isLoggedOut };
