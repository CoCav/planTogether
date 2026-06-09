import LoadingState from "./LoadingState";

/* ==================================================
   PAGE LOADER
   Wraps LoadingState in standard page layout spacing

   Used for:
   - full-page loading states
   - initial page data loading
   - loading title and description passthrough
================================================== */

export default function PageLoader(props) {
    return (
        <div className="container page-section">
            <LoadingState {...props} />
        </div>
    );
}
