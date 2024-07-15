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
    .withMessage("Please enter valid email address!")
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

export {
  registerUserValidation,
  verifyUserRegistrationValidation,
  getSingleUserValidation,
  sendFriendRequestValidation,
  acceptFriendRequestValidation,
  deleteFriendRequestValidation
};
