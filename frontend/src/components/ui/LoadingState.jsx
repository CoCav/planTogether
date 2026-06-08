/* ==================================================
   LOADING STATE
   Displays a loading message while content is loading

   Supports:
   - default loading text
   - custom loading message
   - lightweight decorative spinner
   - accessible live region
================================================== */

export default function LoadingState({ children = "Loading..." }) {
    return (
        <div className="loading-state" role="status" aria-live="polite">
            <span className="loading-state-spinner" aria-hidden="true" />

            <span>
                {children}
            </span>
        </div>
    );
}
