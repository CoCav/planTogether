import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";

import { getMyEvents } from "../api/eventMembershipApi";

import { getMyEventsWithRole } from "../features/events/normalizeData";
import { MY_EVENT_VIEWS, getViewContent } from "../features/events/eventViewConfig";
import { getDefaultEventFilters } from "../features/events/eventFilters";
import { getEventsEmptyState } from "../features/events/eventEmptyState.js";

import useEventActionsWithConfirm from "../hooks/events/useEventActionsWithConfirm";
import useEventFilters from "../hooks/events/useEventFilters.js";
import usePagination from "../hooks/pagination/usePagination.js";

import EventsFilterCard from "../components/events/EventsFilterCard";
import EventsViewTabs from "../components/events/EventsViewTabs.jsx";
import EventCard from "../components/events/EventCard.jsx";

import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import Pagination from "../components/ui/Pagination.jsx";

/* ==================================================
   MY EVENTS PAGE
   Displays and manages events created or joined
   by the current user.

   Supports:
   - created / joined views
   - history views
   - filtering
   - sorting
   - pagination
   - leave action
================================================== */

export default function MyEventsPage() {
    const { user } = useAuth();

    /* =========================
       Local state
       Stores page feedback, events, roles, view and loading state
    ========================= */
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [events, setEvents] = useState([]);
    const [activeView, setActiveView] = useState("created");
    const [loading, setLoading] = useState(true);


    /* =========================
       Pagination state
       Tracks current page and total results
    ========================= */

    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 4,
        totalPages: 1,
        totalEvents: 0
    });


    /* =========================
       Main data loading
       Fetches paginated user events for the selected view
    ========================= */
    const loadData = useCallback(
        async (customFilters = getDefaultEventFilters(), customPage = 1, customView = "created") => {
            try {
                setError("");

                const view = getViewContent(MY_EVENT_VIEWS, customView);

                let { sortBy, order, ...filters } = customFilters;

                sortBy = sortBy || view.defaultSortBy;
                order = order || view.defaultOrder;

                const response = await getMyEvents({
                    view: customView,
                    ...filters,
                    page: customPage,
                    pageSize: pagination.pageSize,
                    sortBy,
                    order
                });

                setEvents(getMyEventsWithRole(response));

                setPagination((prev) => ({
                    ...prev,
                    page: response.data.page || 1,
                    pageSize: response.data.pageSize || prev.pageSize,
                    totalPages: response.data.totalPages || 1,
                    totalEvents: response.data.totalEvents || 0
                }));
            } catch (error) {
                console.error("Error loading my events:", error);
                setError("❌ Failed to load your events");
            } finally {
                setLoading(false);
            }
        },
        [pagination.pageSize]
    );


    /* =========================
       Event filters
       Provides filter state and quick filter actions
    ========================= */
    const {
        filters,
        setFilters,
        showFilters,
        setShowFilters,
        sortLabels,
        isCurrentWeekendFilterActive,
        handleFilterChange,
        handleFilterSubmit,
        handleSortChange,
        handleResetFilters,
        handleTodayFilter,
        handleWeekendFilter
    } = useEventFilters({
        activeView,
        loadData,
        resetPage: () =>
            setPagination((prev) => ({
                ...prev,
                page: 1
            }))
    });

    const emptyState = getEventsEmptyState({ filters, activeView });


    /* =========================
        Pagination controls
       Loads the selected page while preserving filters and view
    ========================= */
    const { handlePreviousPage, handleNextPage } = usePagination({
        page: pagination.page,
        totalPages: pagination.totalPages,
        onPageChange: (nextPage) => loadData(filters, nextPage, activeView),
    });


    /* =========================
       Initial data loading
       Loads the default public events view
    ========================= */
    useEffect(() => {
        loadData(getDefaultEventFilters(), 1, "created");
    }, [loadData]);


    /* =========================
       Feedback cleanup
       Automatically clears success and error messages
    ========================= */
    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => {
                setMessage("");
                setError("");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [message, error]);


    /* =========================
       Role helper
       Resolves current user's role for each event
    ========================= */

    const getRoleByEventId = (eventId) => events.find((event) => event.id === eventId)?.role || null;


    /* =========================
        Event actions
       Handles join / leave operations and reloads data
   ========================= */
    const { handleLeaveEvent } = useEventActionsWithConfirm({
        loadData,
        setMessage,
        setError,
        getRoleByEventId
    });


    /* =========================
       View switching
       Updates active tab, resets pagination and reloads events
    ========================= */
    const handleViewChange = async (nextView) => {
        const nextViewContent = getViewContent(MY_EVENT_VIEWS, nextView);

        const nextFilters = nextViewContent.clearDateFiltersOnEnter ? { ...filters, date: "", startDate: "", endDate: "" } : filters;

        setActiveView(nextView);
        setFilters(nextFilters);

        setPagination((prev) => ({
            ...prev,
            page: 1
        }));

        await loadData(nextFilters, 1, nextView);
    };


    /* =========================
       Loading state
    ========================= */

    if (loading) {
        return (
            <div className="container page-section">
                <LoadingState>Loading events...</LoadingState>
            </div>
        );
    }


    /* =========================
       Derived UI state
       Prepares display data for render
    ========================= */
    const viewContent = getViewContent(MY_EVENT_VIEWS, activeView);
    const showPaginationInfo = pagination.totalPages > 1;


    /* =========================
       Main render
    ========================= */

    return (
        <div className="container page-section">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Events</h1>
                    <p className="page-subtitle">View the events you created and joined.</p>
                </div>
            </div>

            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="danger">{error}</Alert>}

            <EventsFilterCard
                filters={filters}
                showFilters={showFilters}
                sortLabels={sortLabels}
                onToggleFilters={() => setShowFilters((prev) => !prev)}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onSortChange={handleSortChange}
                onResetFilters={handleResetFilters}
            />

            <div className="events-header">
                <div className="events-header-top">
                    <h2 className="section-title">
                        {viewContent.title}
                        <span className="results-count">({pagination.totalEvents})</span>
                    </h2>

                    {showPaginationInfo && (
                        <span className="results-page-info">Page {pagination.page} of {pagination.totalPages}</span>
                    )}
                </div>

                <p className="section-subtitle">{viewContent.subtitle}</p>

                <div className="events-view-bar">
                    <EventsViewTabs
                        views={MY_EVENT_VIEWS}
                        activeView={activeView}
                        onChange={handleViewChange}
                    />

                    {viewContent.showQuickActions && (
                        <div className="events-quick-actions">
                            <Button type="button" variant={filters.date ? "filter-active" : "outline-primary"} onClick={handleTodayFilter}>Today</Button>
                            <Button type="button" variant={isCurrentWeekendFilterActive(filters) ? "filter-active" : "outline-primary"} onClick={handleWeekendFilter}>This Weekend</Button>
                        </div>
                    )}
                </div>
            </div>

            <section className="events-section">
                {events.length === 0 ? (
                    <EmptyState
                        title={emptyState.title || viewContent.empty}
                        description={emptyState.description}
                    />
                ) : (
                    <div className="events-grid">
                        {events.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                user={user}
                                role={event.role}
                                onLeave={handleLeaveEvent}
                                variant="my-events"
                            />
                        ))}
                    </div>
                )}
            </section>

            <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPrevious={handlePreviousPage}
                onNext={handleNextPage}
            />
        </div>
    );
}
