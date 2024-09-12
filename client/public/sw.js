self.addEventListener("push", function (event) {
  const data = event.data
    ? event.data.json()
    : {
        title: "Default Title",
        body: "Default Body",
        url: "https://friends-adda.netlify.app/"
      }; // Add the URL here

  const options = {
    body: data.body,
    icon: "https://res.cloudinary.com/dp0meiglf/image/upload/v1725804750/Friends-chat/yru4nbdwrbpjznm8dulc.png",
    badge:
      "https://res.cloudinary.com/dp0meiglf/image/upload/v1725804750/Friends-chat/yru4nbdwrbpjznm8dulc.png"
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close(); // Close the notification
  event.waitUntil(
    clients.openWindow("https://friends-adda.netlify.app/") // Open the URL
  );
});
