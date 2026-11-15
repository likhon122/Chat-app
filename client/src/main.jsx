import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { Provider } from "react-redux";
import store from "./app/store/store.js";
import AppToaster from "./components/ui/AppToaster.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Provider store={store}>
    <AppToaster />
    <App />
  </Provider>
  //</StrictMode>
);
