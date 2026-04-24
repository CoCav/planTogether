/* ==================================================
   EVENT VIEW TABS
   Secondary navigation for switching event views
================================================== */

export default function EventViewTabs({ activeView, onChange }) {
    return (
        <nav className="event-view-nav" aria-label="Event views">
            
            <button type="button" className={`event-view-nav-item ${activeView === "all" ? "active" : ""}`} onClick={() => onChange("all")}>
                📋 All
            </button>

            <button type="button" className={`event-view-nav-item ${activeView === "upcoming" ? "active" : ""}`} onClick={() => onChange("upcoming")}>
                📅 Upcoming
            </button>

            <button type="button" className={`event-view-nav-item ${activeView === "archives" ? "active" : ""}`} onClick={() => onChange("archives")}>
                🗂️ Archives
            </button>
        </nav>
    );
}