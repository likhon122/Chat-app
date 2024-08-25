// import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Search from "./Search";

import Notification from "./Notification";
import { useSelector } from "react-redux";


const Navbar = () => {
  const userData = useSelector((state) => state.auth.user);

  return (
    <>
      <div className="bg-stone-300">
        <div className="flex items-center justify-center gap-10">
          <div>
            <ul className="flex items-center justify-center gap-4">
              <li>
                <NavLink to={"/"}>Home</NavLink>
              </li>
              <li>
                <NavLink to={"/login"}>Login</NavLink>
              </li>
              <li>
                <NavLink to={"/sign-up"}>SignUp</NavLink>
              </li>
              <li>
                <NavLink to={"/chat/"}>Chat</NavLink>
              </li>
            </ul>
          </div>
          <div>{<Search />}</div>
          <div>{userData && <Notification />}</div>
        </div>
      </div>
    </>
  );
};

export default Navbar;