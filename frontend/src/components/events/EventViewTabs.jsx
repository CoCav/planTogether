/* ==================================================
   EVENT VIEW TABS
   Navigation tabs for switching between event views

   Supports:
   - active tab state
   - icon-based tabs
   - accessible view navigation
================================================== */

export default function EventViewTabs({ views, activeView, onChange }) {
    return (
        <nav className="event-view-tabs" aria-label="Event views">
            {views.map((view) => {
                const isActive =
                    activeView === view.key;

                return (
                    <button
                        key={view.key}
                        type="button"
                        className={`event-view-tab ${isActive ? "is-active" : ""}`.trim()}
                        onClick={() => onChange(view.key)}
                        aria-pressed={isActive}
                    >
                        <span className="event-view-tab-icon">{view.icon}</span>

                        <span>{view.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
