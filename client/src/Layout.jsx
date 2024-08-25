// import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import { SocketProvider } from "./Socket";
// import { SocketProvider } from "./Socket";

const Layout = () => {
  return (
    <>
      <SocketProvider>
        <Navbar />
        <Outlet />
        <Footer />
      </SocketProvider>
    </>
  );
};

export default Layout;