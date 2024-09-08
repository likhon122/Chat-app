import NotificationSubscriptionModel from "../models/notificationSubscription.model.js";
import { body, validationResult } from "express-validator";

// Middleware for validating subscription data
const validateSubscription = [
  body("endpoint").isURL().withMessage("Endpoint must be a valid URL"),
  body("keys")
    .isObject()
    .withMessage("Keys must be an object containing p256dh and auth"),
  body("userId").isString().optional() // Optional userId validation
];

// Push notification controller
const pushNotification = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { endpoint, keys, userId } = req.body;

    const existingSubscription = await NotificationSubscriptionModel.findOne({
      endpoint
    });

    if (existingSubscription) {
      // Update the existing subscription with new keys or userId if needed
      existingSubscription.keys = keys;
      existingSubscription.userId = userId;
      await existingSubscription.save();

      return res
        .status(200)
        .json({ message: "Subscription updated successfully" });
    }

    const subscription = new NotificationSubscriptionModel({
      endpoint,
      keys,
      userId
    });
    await subscription.save();

    res.status(201).json({ message: "Subscription saved successfully" });
  } catch (error) {
    next(error);
  }
};

// Unsubscribe controller
const unsubscribeNotification = async (req, res, next) => {
  const { endpoint } = req.body;

  try {
    const result = await NotificationSubscriptionModel.deleteOne({ endpoint });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    next(error);
  }
};

export { pushNotification, unsubscribeNotification, validateSubscription };
