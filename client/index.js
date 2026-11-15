const getServerUrl = () => {
  const envUrl = import.meta.env.VITE_SERVER_URL;

  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;

    // When accessing via HTTPS (e.g. self-signed dev HTTPS on mobile: https://192.168.x.x:5173)
    // Return origin so requests seamlessly pass through Vite's HTTPS proxy to prevent Mixed Content block
    if (protocol === "https:" && (!envUrl || envUrl.startsWith("http://"))) {
      return window.location.origin;
    }

    // When accessing from another device on the local network (e.g. 192.168.x.x, 10.x.x.x)
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      // If VITE_SERVER_URL is explicitly pointing to an external/production URL (not localhost), use that
      if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
        return envUrl;
      }
      // If in local development, point to the host machine's IP on backend port 7777
      return `${protocol}//${hostname}:7777`;
    }
  }

  return envUrl || "http://localhost:7777";
};

const serverUrl = getServerUrl();

const notificationImage = "message.png";

export { serverUrl, notificationImage };
