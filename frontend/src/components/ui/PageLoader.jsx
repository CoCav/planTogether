import LoadingState from "./LoadingState";

/* ==================================================
   PAGE LOADING
   Displays a full-page loading state

   Wraps:
   - LoadingState
   - page layout spacing
================================================== */

export default function PageLoading({ children = "Loading..." }) {

    return (
        <div className="container page-section">
            <LoadingState>{children}</LoadingState>
        </div>
    );
}