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

/* Refactor in progress */
import "./styles/pages/account-page.css";
import "./styles/pages/event-details-page.css";
import "./styles/pages/event-form-page.css";
import "./styles/pages/event-listing-page.css";

import "./styles/components/auth/login-form.css";

import "./styles/components/events/event-card-actions.css";
import "./styles/components/events/event-card.css";
import "./styles/components/events/event-details-actions.css";
import "./styles/components/events/event-details-summary.css";
import "./styles/components/events/event-form.css";
import "./styles/components/events/event-members-section.css";
import "./styles/components/events/event-view-tabs.css";
import "./styles/components/events/events-filter-card.css";
import "./styles/components/events/events-toolbar.css";

import "./styles/components/users/password-field.css";
import "./styles/components/users/password-requirements.css";
import "./styles/components/users/user-form.css";

import "./styles/components/layout/footer.css";
import "./styles/components/layout/navbar.css";
import "./styles/components/layout/navbar-user-menu.css";

import "./styles/components/ui/alert.css";
import "./styles/components/ui/badge.css";
import "./styles/components/ui/button.css";
import "./styles/components/ui/card.css";
import "./styles/components/ui/empty-state.css";
import "./styles/components/ui//form-controls.css";
import "./styles/components/ui/formfield.css";
import "./styles/components/ui/loading-state.css";
import "./styles/components/ui/pagination.css";
import "./styles/components/ui/select.css";
import "./styles/components/ui/textarea.css";

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
