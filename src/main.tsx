// ---------------------------------------------------------------
// main.tsx — Giriş noktası. Redux Provider'ı ve stilleri bağlar.
// ---------------------------------------------------------------
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App";

// Önce Bootstrap, sonra kendi stillerimiz (bizimkiler ezebilsin diye)
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
