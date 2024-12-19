import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import { SocketProvider } from "./Socket";

const ChatLayout = () => {
  return (
    <>
      <SocketProvider>
        <Navbar />
        <Outlet />
      </SocketProvider>
      <Footer />
    </>
  );
};

export default ChatLayout;
