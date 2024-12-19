import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

import { Provider } from "react-redux";
import store from "./app/store/store.js";
import { ToastContainer } from "react-toastify";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Provider store={store}>
    <ToastContainer />
    <App />
  </Provider>
  //</StrictMode>
);
