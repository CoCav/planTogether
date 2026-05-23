/* ==================================================
   EMPTY STATE
   Displays a reusable empty state when no data is available

   Supports:
   - title and description
   - optional icon
   - decorative icon support
   - fallback children content
================================================== */

export default function EmptyState({ title, description, icon, children }) {

    /* =========================
       LAYOUT
    ========================= */

    const content =
        title ? (
            <h3 className="empty-state-title">
                {title}
            </h3>
        )
            : children;

    return (
        <div className="empty-state">
            {icon && (
                <div className="empty-state-icon" aria-hidden="true">
                    {icon}
                </div>
            )}

            {content}

            {description && (
                <p className="empty-state-description">
                    {description}
                </p>
            )}
        </div>
    );
}
