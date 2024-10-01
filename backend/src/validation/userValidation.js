import { body, check } from "express-validator";

const registerUserValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required! Please enter valid name!")
    .trim(),
  body("username")
    .notEmpty()
    .withMessage(
      "Username is required to sign up! Please enter valid and unique username!"
    )
    .trim(),
  body("email")
    .notEmpty()
    .withMessage("User email is required to sign up!")
    .trim()
    .isEmail()
    .withMessage("Please enter valid email address!"),

  body("password")
    .notEmpty()
    .withMessage("Password is required to sign up!")
    .trim()
];

const verifyUserRegistrationValidation = [
  body("token")
    .trim()
    .notEmpty()
    .withMessage(
      "Something is missing please make sure you provide correct email or you visit correct site!!"
    )
];

const getSingleUserValidation = [
  body("id")
    .trim()
    .notEmpty()
    .withMessage("id is missing please make sure you provide correct user id!!")
];

const sendFriendRequestValidation = [
  body("sender")
    .trim()
    .notEmpty()
    .withMessage(
      "Sender id is missing please make sure you provide correct sender id!!"
    ),
  body("receiver")
    .trim()
    .notEmpty()
    .withMessage(
      "Receiver id is missing please make sure you provide correct receiver id!!"
    )
];

const acceptFriendRequestValidation = [
  body("acceptId")
    .trim()
    .notEmpty()
    .withMessage(
      "Accept Id id is missing please make sure you provide correct AcceptId!!"
    )
];

const deleteFriendRequestValidation = [
  body("deleteId")
    .trim()
    .notEmpty()
    .withMessage(
      "Accept Id id is missing please make sure you provide correct AcceptId!!"
    )
];
const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required to reset your password!")
    .isEmail()
    .withMessage("Please enter valid email address!")
];

const resetPasswordValidation = [
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required to reset your password!"),
  body("token")
    .trim()
    .notEmpty()
    .withMessage(
      "Token is required to reset your password! Please provide valid token! And make sure you provide this token in 5 minutes!"
    )
];

export {
  registerUserValidation,
  verifyUserRegistrationValidation,
  getSingleUserValidation,
  sendFriendRequestValidation,
  acceptFriendRequestValidation,
  deleteFriendRequestValidation,
  forgotPasswordValidation,
  resetPasswordValidation
};
