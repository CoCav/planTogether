/* ==================================================
   EMPTY STATE COMPONENT
   Displays a fallback message when no data is available
================================================== */
export default function EmptyState({ children }) {

    /* =========================
       Render empty state
       Shows a simple placeholder message
    ========================= */
    return <p className="empty-state">{children}</p>;
}