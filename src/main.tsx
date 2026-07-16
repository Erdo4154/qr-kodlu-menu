// ---------------------------------------------------------------
// main.tsx — Giriş noktası. Redux Provider'ı ve stilleri bağlar.
// ---------------------------------------------------------------
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";
import { store } from "./store/store";
import App from "./App";

// Önce Bootstrap, sonra kendi stillerimiz (bizimkiler ezebilsin diye)
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

// HashRouter: Vercel gibi statik barındırmada sunucu tarafında ekstra
// yönlendirme (rewrite) ayarı gerektirmez — /admin, /#/admin olarak çalışır.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  </React.StrictMode>
);
