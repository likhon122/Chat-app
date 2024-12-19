import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This allows the server to listen on all network interfaces
    port: 5173, // You can change this to any available port
    strictPort: true // Optional: fail if the port is already in use
  }
});
