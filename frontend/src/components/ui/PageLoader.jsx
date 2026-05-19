import LoadingState from "./LoadingState";

/* ==================================================
   PAGE LOADER
   Wraps LoadingState in standard page layout spacing

   Used for:
   - full-page loading states
   - initial page data loading
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
