/* ==================================================
   PAGE LOADING COMPONENT
   --------------------------------------------------
   Displays a full-page loading state.

   Wraps LoadingState with layout styling used across pages
   to ensure consistent spacing and alignment.
================================================== */

import LoadingState from "./LoadingState";

export default function PageLoading({ children = "Loading..." }) {

    /* =========================
       Render full-page loader
       Applies container + page spacing
    ========================= */

    return (
        <div className="container page-section">
            <LoadingState>{children}</LoadingState>
        </div>
    );
}