import { body, check } from "express-validator";

const loginVerification = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("User email is required to login! Please enter your email!")
    .isEmail()
    .withMessage("User email is required to login! Please enter valid email."),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(
      "User Password is required to login! Please enter your correct password!"
    )
    .isLength({ min: 4, max: 16 })
    .withMessage(
      "Make sure User Password is must be minimum 4 character long and maximum 16 characters long!!"
    )
];

export { loginVerification };
