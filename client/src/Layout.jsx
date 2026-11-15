import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import { SocketProvider } from "./Socket";
import { CallProvider } from "./context/CallContext";
import MinimizedCallWidget from "./components/call/MinimizedCallWidget";
import MakeGroup from "./pages/profile/MakeGroup";

const Layout = () => {
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const isChatRoute = location.pathname.startsWith("/chat");
  const isLoggedIn = Boolean(user?._id || user);

  useEffect(() => {
    if (isChatRoute) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isChatRoute]);

  return (
    <SocketProvider>
      <CallProvider>
        <div
          className={
            isChatRoute
              ? "h-screen max-h-screen flex flex-col overflow-hidden"
              : "min-h-screen flex flex-col"
          }
        >
          <div className="flex-shrink-0">
            <Navbar />
          </div>
          <main
            className={
              isChatRoute ? "flex-1 min-h-0 overflow-hidden" : "flex-1"
            }
          >
            <Outlet />
          </main>
          <MinimizedCallWidget />
          {isLoggedIn && <MakeGroup />}
          {!isLoggedIn && !isChatRoute && <Footer />}
        </div>
      </CallProvider>
    </SocketProvider>
  );
};

export default Layout;
