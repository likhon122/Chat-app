import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: true, // This allows the server to listen on all network interfaces
    port: 5173, // You can change this to any available port
    strictPort: true, // Optional: fail if the port is already in use
    proxy: {
      "/api": {
        target: "http://localhost:7777",
        changeOrigin: true,
        secure: false
      },
      "/socket.io": {
        target: "http://localhost:7777",
        changeOrigin: true,
        ws: true,
        secure: false
      }
    }
  }
});
