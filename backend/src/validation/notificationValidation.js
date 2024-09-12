import { body, query, validationResult } from "express-validator";

const validateSubscription = [
  body("endpoint").isURL().withMessage("Endpoint must be a valid URL"),
  body("keys")
    .isObject()
    .withMessage("Keys must be an object containing p256dh and auth"),
  body("userId").isString().optional() // Optional userId validation
];

const getNotificationValidation = [
  query("userId").trim().isString().notEmpty().withMessage("userId is required")
];

const notificationValidation = [
  body("userId").trim().isString().notEmpty().withMessage("userId is required"),
  body("chatId").trim().isString().notEmpty().withMessage("chatId is required")
];

const deleteNotificationValidation = [
  body("chatId")
    .trim()
    .isString()
    .notEmpty()
    .withMessage("notificationId is required")
];

export {
  validateSubscription,
  notificationValidation,
  deleteNotificationValidation,
  getNotificationValidation
};
