/* ==================================================
   EVENT VIEW TABS
   Generic navigation tabs for switching between event views
================================================== */

export default function EventViewTabs({ views, activeView, onChange }) {
    return (
        <nav className="event-view-nav" aria-label="Event views">
            {views.map((view) => (
                <button
                    key={view.key}
                    type="button"
                    className={`event-view-nav-item ${activeView === view.key ? "active" : ""}`}
                    onClick={() => onChange(view.key)}
                    aria-pressed={activeView === view.key}
                >
                    <span className="event-view-icon">{view.icon}</span>
                    <span>{view.label}</span>
                </button>
            ))}
        </nav>
    );
}
