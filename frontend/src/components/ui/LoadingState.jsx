/* ==================================================
   LOADING STATE COMPONENT
   Displays a loading message while content is being fetched
================================================== */

export default function LoadingState({ children = "Loading..." }) {

    /* =========================
       Render loading state
       Shows a default or custom loading message
    ========================= */
    return <div className="loading-state">{children}</div>;
}