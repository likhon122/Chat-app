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

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  try {
    webpush.setVapidDetails(
      "mailto:md.likhonislam2x@gmail.com",
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );
  } catch (error) {
    console.warn("Failed to initialize WebPush VAPID details:", error.message);
  }
} else {
  console.warn("WebPush VAPID keys not configured. Push notifications will be skipped.");
}

const sendPushNotification = async (subscription, payload) => {
  if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
    return;
  }
  try {
    await webpush.sendNotification(subscription, payload);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};

const sendNotificationToUser = async (notificationData) => {
  const [subscription, senderName, chatInfo] = await Promise.all([
    NotificationSubscriptionModel.findOne({ userId: notificationData.member }),
    User.findById(notificationData.sender).select("name"),
    Chat.findById(notificationData.chat).select("chatName groupChat")
  ]);


  if (subscription) {
    const payload = JSON.stringify({
      title: chatInfo.groupChat
        ? `${senderName.name} send a message in ${chatInfo.chatName}`
        : `${senderName.name} send you a new message`,
      body: notificationData.content
    });
    await sendPushNotification(subscription, payload);
  } else {
    console.log(`No subscription found for userId: ${notificationData.member}`);
  }
};

export { sendNotificationToUser };
