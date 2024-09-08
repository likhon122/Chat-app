import React, { useEffect } from "react";

const PushNotificationManager = ({ userId, pushNotificationPublicKey }) => {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log("Service Worker registered:", registration);

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(pushNotificationPublicKey) 
          });

          console.log("User is subscribed:", subscription);
          await sendSubscriptionToServer(subscription);
        } catch (error) {
          console.error("Failed to subscribe to push notifications:", error);
        }
      }
    };

    const sendSubscriptionToServer = async (subscription) => {
      try {
        const response = await fetch("/api/v1/push-notification", {
          method: "POST",
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
              auth: btoa(
                String.fromCharCode(
                  ...new Uint8Array(subscription.getKey("auth"))
                )
              ),
              p256dh: btoa(
                String.fromCharCode(
                  ...new Uint8Array(subscription.getKey("p256dh"))
                )
              )
            },
            userId: userId // Use the provided user ID
          }),
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Failed to send subscription to server");
        }

        console.log("Subscription sent to server successfully");
      } catch (error) {
        console.error("Error sending subscription to server:", error);
      }
    };

    const urlB64ToUint8Array = (base64String) => {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const rawData = window.atob(base64);
      return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
    };

    
    registerServiceWorker();
  }, [userId, pushNotificationPublicKey]);

  return null; 
};

export default PushNotificationManager;
