/* ==================================================
   EMPTY STATE
   Reusable component displayed when no data is available
================================================== */

export default function EmptyState({ title, description, icon, children }) {
    return (
        <div className="empty-state">
            {icon && <div className="empty-state-icon">{icon}</div>}

            {title ? (
                <h3 className="empty-state-title">{title}</h3>
            ) : (
                children
            )}

            {description && (<p className="empty-state-description">{description}</p>)}
        </div>
    );
}