import React, { useEffect } from "react";
import { serverUrl } from "..";

const PushNotificationManager = ({ userId, pushNotificationPublicKey }) => {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(pushNotificationPublicKey)
          });

          await sendSubscriptionToServer(subscription);
        } catch (error) {
          return;
        }
      }
    };

    const sendSubscriptionToServer = async (subscription) => {
      try {
        const response = await fetch(
          `${serverUrl}/api/v1/notification/make-push-notification`,
          {
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
              userId: userId
            }),
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include" 
          }
        );

        if (!response.ok) {
          return;
        }

        if (response.status === 401) {
          return;
        } else if (!response.ok) {
          return;
        }
      } catch (error) {
        return;
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
