import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import { SocketProvider } from "./Socket";
import { useSelector } from "react-redux";
import GlobalCallHandler from "./GlobalHandler";

const Layout = () => {
  const theme = useSelector((state) => state.other.theme);

  return (
    <SocketProvider>
      <GlobalCallHandler />
      <Navbar />
      <Outlet />
      {/* <Footer /> */}
    </SocketProvider>
  );
};

export default Layout;
