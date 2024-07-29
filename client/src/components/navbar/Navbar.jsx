// import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <>
      <div className="bg-stone-300">
        <div>
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
                <NavLink to={"/chat"}>Chat</NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
