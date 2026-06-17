import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import AuthProvider from "./context/auth/AuthProvider";

import { setupLeafletIcons } from "./utils/eventMap";

import "leaflet/dist/leaflet.css";

import "./styles/reset.css";
import "./styles/theme.css";
import "./styles/layout.css";

import "./styles/pages/account-page.css";
import "./styles/pages/event-details-page.css";
import "./styles/pages/event-form-page.css";
import "./styles/pages/event-listing-page.css";
import "./styles/pages/home-page.css";
import "./styles/pages/my-profile-page.css";
import "./styles/pages/public-user-page.css";

import "./styles/components/auth/login-form.css";

import "./styles/components/eventMemberships/event-members-section.css";
import "./styles/components/eventMemberships/event-actions-menu.css";

import "./styles/components/eventReviews/event-review-actions.css";
import "./styles/components/eventReviews/event-review-card.css";
import "./styles/components/eventReviews/event-review-form.css";
import "./styles/components/eventReviews/event-reviews-list.css";
import "./styles/components/eventReviews/event-reviews-section.css";

import "./styles/components/events/event-card-actions.css";
import "./styles/components/events/event-card.css";
import "./styles/components/events/event-details-actions.css";
import "./styles/components/events/event-details-summary.css";
import "./styles/components/events/event-form.css";
import "./styles/components/events/event-location-field.css";
import "./styles/components/events/event-location-map.css";
import "./styles/components/events/event-view-tabs.css";
import "./styles/components/events/events-filter-card.css";
import "./styles/components/events/events-toolbar.css";

import "./styles/components/users/delete-account-section.css";
import "./styles/components/users/password-field.css";
import "./styles/components/users/password-requirements.css";
import "./styles/components/users/user-avatar.css";

import "./styles/components/forms/event-form-map.css";
import "./styles/components/forms/file-upload-preview-field.css";

import "./styles/components/layout/footer.css";
import "./styles/components/layout/navbar.css";
import "./styles/components/layout/navbar-user-menu.css";

import "./styles/components/ui/alert.css";
import "./styles/components/ui/badge.css";
import "./styles/components/ui/button.css";
import "./styles/components/ui/card.css";
import "./styles/components/ui/empty-state.css";
import "./styles/components/ui/form-controls.css";
import "./styles/components/ui/form-field.css";
import "./styles/components/ui/loading-state.css";
import "./styles/components/ui/pagination.css";
import "./styles/components/ui/select.css";
import "./styles/components/ui/textarea.css";

import "./styles/components/link.css";

/* ==================================================
   LEAFLET
   Configures Leaflet map assets for Vite
================================================== */

setupLeafletIcons();

/* ==================================================
   MAIN ENTRY
   Initializes and mounts the React application

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
