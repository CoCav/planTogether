/* ==================================================
   MY EVENTS VIEW TABS
   Navigation tabs for switching My Events views

   Views:
   - created events
   - created history
   - joined events
   - joined history
================================================== */

export default function MyEventsViewTabs({ activeView, onChange }) {
    const views = [
        { key: "created", label: "Created" },
        { key: "createdHistory", label: "Created History" },
        { key: "joined", label: "Joined" },
        { key: "joinedHistory", label: "Joined History" }
    ];

    return (
        <nav className="event-view-nav" aria-label="My events views">
            {views.map((view) => (
                <button key={view.key} type="button" className={`event-view-nav-item ${activeView === view.key ? "active" : ""}`} onClick={() => onChange(view.key)}>
                    {view.label}
                </button>
            ))}
        </nav>
    );
}