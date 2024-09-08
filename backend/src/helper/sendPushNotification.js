import webpush from "web-push";
import NotificationSubscriptionModel from "../models/notificationSubscription.model.js";
import {
  pushNotificationPrivateKey,
  pushNotificationPublicKey
} from "../secret.js";

// Set your VAPID keys here if not already set
const vapidKeys = {
  publicKey: pushNotificationPublicKey,
  privateKey: pushNotificationPrivateKey
};

// console.log(vapidKeys);

webpush.setVapidDetails(
  "mailto:md.likhonislam2x@gmail.com", // Your email address
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const sendPushNotification = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, payload);
    console.log("Push notification sent successfully!");
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};

const sendNotificationToUser = async (userId) => {
  const subscription = await NotificationSubscriptionModel.findOne({ userId });
  if (subscription) {
    const payload = JSON.stringify({
      title: "New Message",
      body: "You have a new message!"
    });
    await sendPushNotification(subscription, payload);
  } else {
    console.log(`No subscription found for userId: ${userId}`);
  }
};

export { sendNotificationToUser };
