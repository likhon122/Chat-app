import webpush from "web-push";
import NotificationSubscriptionModel from "../models/notificationSubscription.model.js";
import {
  pushNotificationPrivateKey,
  pushNotificationPublicKey
} from "../secret.js";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";

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
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};

const sendNotificationToUser = async (notificationData) => {
  const [subscription, senderName, chatName] = await Promise.all([
    NotificationSubscriptionModel.findOne({ userId: notificationData.member }),
    User.findById(notificationData.sender).select("name"),
    Chat.findById(notificationData.chat).select("chatName")
  ]);

  if (subscription) {
    const payload = JSON.stringify({
      title: `${senderName.name} sent a message in ${chatName.chatName}`,
      body: notificationData.content
    });
    await sendPushNotification(subscription, payload);
  } else {
    console.log(`No subscription found for userId: ${notificationData.member}`);
  }
};

export { sendNotificationToUser };
