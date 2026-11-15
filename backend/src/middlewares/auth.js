import { verifyJsonWebToken, getCookieOptions } from "../helper/jsonWebToken.js";
import { errorResponse } from "../helper/responseHandler.js";
import User from "../models/user.model.js";
import { accessTokenKey } from "../secret.js";

const isLoggedIn = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return errorResponse(res, {
        statusCode: 401,
        errorMessage: "Access token not found please login again!",
        nextURl: {
          login: "/api/v1/login"
        }
      });
    }

    let userInfo;
    try {
      userInfo = verifyJsonWebToken(accessToken, accessTokenKey);
    } catch (tokenError) {
      res.clearCookie("accessToken", getCookieOptions());
      res.clearCookie("refreshToken", getCookieOptions());
      return errorResponse(res, {
        statusCode: 401,
        errorMessage: "Access token is invalid or expired, please login again!",
        nextURl: {
          login: "/api/v1/login"
        }
      });
    }

    if (!userInfo) {
      return errorResponse(res, {
        statusCode: 401,
        errorMessage: "Access token not valid please login again!",
        nextURl: {
          login: "/api/v1/login"
        }
      });
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
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "User not found with access token please login again",
        nextURl: {
          login: "/api/v1/login"
        }
      });
    }

    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return errorResponse(res, {
        statusCode: 401,
        errorMessage: "You are not admin please go back!!",
        nextURl: {}
      });
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
      try {
        const userInfo = verifyJsonWebToken(accessToken, accessTokenKey);
        if (userInfo) {
          return errorResponse(res, {
            statusCode: 400,
            errorMessage: "You are already Logged In please logOut first!",
            nextURl: {
              logOut: "/api/v1/log-out"
            }
          });
        }
      } catch (tokenError) {
        res.clearCookie("accessToken", getCookieOptions());
        res.clearCookie("refreshToken", getCookieOptions());
      }
    }

    next();
  } catch (error) {
    return next(error);
  }
};

const socketAuthenticator = async (socket, next) => {
  try {
    const { accessToken } = socket.request.cookies || {};

    if (!accessToken) {
      return next(
        new Error("Authentication error: Please login and send messages!")
      );
    }

    let userInfo;
    try {
      userInfo = verifyJsonWebToken(accessToken, accessTokenKey);
    } catch (tokenError) {
      return next(
        new Error("Authentication error: Please login and send messages!")
      );
    }

    if (!userInfo) {
      return next(
        new Error("Authentication error: Please login and send messages!")
      );
    }

    socket.user = userInfo;

    next();
  } catch (error) {
    return next(
      new Error("Authentication error: Please login and send messages!")
    );
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

export { isLoggedIn, isAdmin, isLoggedOut, socketAuthenticator };
