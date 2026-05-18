import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import AuthProvider from "./context/auth/AuthProvider";

import "./styles/theme.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/helpers.css";
import "./styles/navigation.css";

import "./styles/pages.css";
import "./styles/components.css";

/* Refactor in progress */
import "./styles/pages/events.css";
import "./styles/components/events/event-card.css";
import "./styles/components/events/event.filters.css";
import "./styles/components/events/event-view.tabs.css";

import "./styles/components/pagination.css";

/* ==================================================
   MAIN ENTRY
   Mounts the React application

   Provides:
   - React StrictMode
   - BrowserRouter
   - AuthProvider
   - global styles
================================================== */

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
