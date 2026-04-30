/* ==================================================
   EVENTS VIEW TABS
   Navigation tabs for switching between event views

   Views:
   - all events
   - upcoming events
   - archived events
================================================== */

export default function EventViewTabs({ activeView, onChange }) {
    const views = [
        { key: "all", label: "All", icon: "📋" },
        { key: "upcoming", label: "Upcoming", icon: "📅" },
        { key: "archives", label: "Archives", icon: "🗂️" }
    ];

    return (
        <nav className="event-view-nav" aria-label="Event views">
            {views.map((view) => (
                <button key={view.key} type="button" className={`event-view-nav-item ${activeView === view.key ? "active" : ""}`} onClick={() => onChange(view.key)} aria-pressed={activeView === view.key}>
                    <span className="event-view-icon">{view.icon}</span>
                    <span>{view.label}</span>
                </button>
            ))}
        </nav>
    );
}
