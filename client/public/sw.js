self.addEventListener("push", function (event) {
  const data = event.data
    ? event.data.json()
    : { title: "Default Title", body: "Default Body" };

  const options = {
    body: data.body,
    icon: "icon.png", // Path to your icon
    badge: "badge.png" // Path to your badge
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
