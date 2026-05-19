import LoadingState from "./LoadingState";

/* ==================================================
   PAGE LOADER
   Displays a full-page loading layout

   Wraps:
   - LoadingState
   - container spacing
================================================== */

export default function PageLoader({ children = "Loading..." }) {
    return (
        <div className="container page-section">
            <LoadingState>
                {children}
            </LoadingState>
        </div>
    );
}
