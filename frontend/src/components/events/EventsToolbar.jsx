import { CalendarDays, CalendarRange } from "lucide-react";

import Button from "../ui/Button";
import EventViewTabs from "./EventViewTabs";

/* ==================================================
   EVENTS TOOLBAR
   Displays event results heading and controls

   Handles:
   - results title and subtitle rendering
   - optional results count display
   - pagination info display
   - view tab rendering
   - quick date filter visibility
   - quick date filter callbacks
   - active quick filter state
   - accessible live results metadata
   - decorative quick filter icons

   Notes:
   - result count is only displayed when available
   - supports pages with and without quick actions
================================================== */

export default function EventsResultsToolbar({
    titleId,
    title,
    subtitle,
    totalEvents,

    page,
    totalPages,
    showPaginationInfo,

    views,
    activeView,
    showQuickActions,

    filters,
    isCurrentWeekendFilterActive,

    onViewChange,
    onTodayFilter,
    onWeekendFilter
}) {

    return (
        <div className="events-results-header">
            <div className="events-results-meta">
                <div>
                    <h2 id={titleId} className="section-title">
                        {title}

                        {totalEvents !== null && totalEvents !== undefined && (
                            <span className="events-results-count" aria-live="polite">
                                ({totalEvents})
                            </span>
                        )}
                    </h2>

                    <p className="section-subtitle">{subtitle}</p>
                </div>

                {showPaginationInfo && (
                    <p
                        className="events-results-page-info"
                        aria-live="polite"
                    >
                        Page {page} of {totalPages}
                    </p>
                )}
            </div>

            <div className="events-view-controls">
                <EventViewTabs
                    views={views}
                    activeView={activeView}
                    onChange={onViewChange}
                />

                {showQuickActions && (
                    <div className="events-quick-actions" role="group" aria-label="Quick event filters">
                        <Button
                            type="button"
                            variant={filters.date ? "filter-active" : "outline-primary"}
                            onClick={onTodayFilter}
                        >
                            <CalendarDays aria-hidden="true" />
                            Today
                        </Button>

                        <Button
                            type="button"
                            variant={isCurrentWeekendFilterActive(filters) ? "filter-active" : "outline-primary"}
                            onClick={onWeekendFilter}
                        >
                            <CalendarRange aria-hidden="true" />
                            This Weekend
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
