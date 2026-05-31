/* ==================================================
   EVENT VIEW TABS
   Navigation tabs for switching between event views

   Handles:
   - active tab state
   - accessible tab navigation
   - decorative tab icons
   - mobile horizontal scrolling
================================================== */

export default function EventViewTabs({ views, activeView, onChange }) {
    return (
        <div className="event-view-tabs-scroll">
            <div className="event-view-tabs" role="tablist" aria-label="Event views">
                {views.map((view) => {
                    const isActive = activeView === view.key;

                    return (
                        <button
                            key={view.key}
                            type="button"
                            role="tab"
                            className={`event-view-tab ${isActive ? "is-active" : ""}`.trim()}
                            onClick={() => onChange(view.key)}
                            aria-selected={isActive}
                            tabIndex={isActive ? 0 : -1}
                        >
                            <span className="event-view-tab-icon" aria-hidden="true">
                                {view.icon}
                            </span>

                            <span>{view.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
