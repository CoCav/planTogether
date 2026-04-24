/* ==================================================
   MY EVENTS VIEW TABS
   Secondary navigation for My Events page
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
                <button
                    key={view.key}
                    type="button"
                    className={`event-view-nav-item ${activeView === view.key ? "active" : ""}`}
                    onClick={() => onChange(view.key)}
                >
                    {view.label}
                </button>
            ))}
        </nav>
    );
}