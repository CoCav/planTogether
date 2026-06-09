/* ==================================================
   LOADING STATE
   Displays accessible loading feedback

   Supports:
   - default loading title
   - optional loading description
   - decorative animated spinner
   - accessible live region
================================================== */

export default function LoadingState({ title = "Loading...", description }) {
    return (
        <div
            className="loading-state"
            role="status"
            aria-live="polite"
        >
            <span
                className="loading-state-spinner"
                aria-hidden="true"
            />

            <div className="loading-state-content">
                <p className="loading-state-title">
                    {title}
                </p>

                {description && (
                    <p className="loading-state-description">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
