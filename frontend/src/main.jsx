import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import AuthProvider from "./context/auth/AuthProvider";

import "./styles/theme.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/helpers.css";

import "./styles/pages.css";
import "./styles/components.css";

/* Refactor in progress */
import "./styles/pages/events-page.css";
import "./styles/pages/event-details-page.css";

import "./styles/components/events/event-card.css";
import "./styles/components/events/event-filters.css";
import "./styles/components/events/event-view.tabs.css";

import "./styles/components/events/event-details-actions.css";
import "./styles/components/events/event-details-summary.css";
import "./styles/components/events/event-members-section.css";

import "./styles/components/pagination.css";

import "./styles/components/layout/navbar.css";
import "./styles/components/layout/navbar-user-menu.css";
import "./styles/components/layout/footer.css";

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
