import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import AuthProvider from "./context/authProvider.jsx";
import './styles/theme.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/pages.css'
import './styles/components.css'
import './styles/helpers.css'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);