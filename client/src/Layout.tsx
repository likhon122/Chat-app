import { Outlet } from "react-router-dom";

import Navbar from "./components/navbar/Navbar";
import { SocketProvider } from "./Socket";
import GlobalCallHandler from "./GlobalHandler";

const Layout = () => {
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
