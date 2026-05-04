import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";

import { getMyEvents } from "../api/eventMembershipApi";

import { getMyEventsWithRole } from "../features/events/normalizeData";
import { MY_EVENT_VIEWS, getViewContent } from "../features/events/eventViewConfig";
import { getDefaultEventFilters } from "../features/events/eventFilters";
import { buildSearchParams, getInitialFiltersFromUrl, getInitialPageFromUrl, getInitialViewFromUrl } from "../features/events/eventQueryParams";
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
    const [searchParams, setSearchParams] = useSearchParams();

    /* =========================
        URL initial state
        Reads view, page and filters from query params
    ========================= */
    const initialView = useMemo(() => getInitialViewFromUrl(searchParams, MY_EVENT_VIEWS, "created"), [searchParams]);
    const initialPage = useMemo(() => getInitialPageFromUrl(searchParams), [searchParams]);
    const initialFilters = useMemo(() => getInitialFiltersFromUrl(searchParams), [searchParams]);


    /* =========================
       Local state
       Stores page feedback, events, roles, view and loading state
    ========================= */
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [events, setEvents] = useState([]);
    const [activeView, setActiveView] = useState(initialView);

    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);


    /* =========================
       Pagination state
       Tracks current page and total results
    ========================= */

    const [pagination, setPagination] = useState({
        page: initialPage,
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
                setLoading(true);

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
                setInitialLoading(false);
            }
        },
        [pagination.pageSize]
    );


    /* =========================
        URL synchronization
        Keeps filters, page and view reflected in the URL
    ========================= */
    const syncUrl = useCallback((nextFilters, nextPage, nextView) => {
        setSearchParams(buildSearchParams(nextFilters, nextPage, nextView));
    },
        [setSearchParams]
    );


    /* =========================
       Data loading with URL sync
       Updates query params before loading events
    ========================= */
    const loadDataAndSyncUrl = useCallback(async (nextFilters, nextPage = 1, nextView = activeView) => {
        syncUrl(nextFilters, nextPage, nextView);
        await loadData(nextFilters, nextPage, nextView);
    },
        [activeView, loadData, syncUrl]
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
        loadData: loadDataAndSyncUrl,
        initialFilters,
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
        onPageChange: (nextPage) => loadDataAndSyncUrl(filters, nextPage, activeView)

    });

    /* =========================
        Initial data loading (run once)
        Loads events from URL-derived state (filters, page, view)

        Uses a ref guard to prevent multiple executions:
            - avoids React StrictMode double calls in development
            - avoids re-runs caused by unstable dependencies (URL params)
    ========================= */
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        if (hasLoadedRef.current) return;

        hasLoadedRef.current = true;

        loadData(initialFilters, initialPage, initialView);
    }, [loadData, initialFilters, initialPage, initialView]);



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
        loadData: loadDataAndSyncUrl,
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

        await loadDataAndSyncUrl(nextFilters, 1, nextView);
    };

    /* =========================
           Derived UI state
           Prepares display data for render
    ========================= */
    const viewContent = getViewContent(MY_EVENT_VIEWS, activeView);
    const showPaginationInfo = pagination.totalPages > 1;



    /* =========================
       Loading state
    ========================= */

    if (initialLoading) {
        return (
            <div className="container page-section">
                <LoadingState>Loading events...</LoadingState>
            </div>
        );
    }


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
                {loading ? (
                    <LoadingState>Refreshing events...</LoadingState>
                ) : events.length === 0 ? (
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
