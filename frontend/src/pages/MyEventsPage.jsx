import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { getMyEvents } from "../api/eventMembershipApi";
import { getMyEventsWithRole } from "../features/events/normalizeData";
import { getDefaultEventFilters } from "../features/events/eventFilters";
import { getEventsEmptyState } from "../features/events/eventEmptyState.js";

import useEventActionsWithConfirm from "../hooks/events/useEventActionsWithConfirm";
import useEventFilters from "../hooks/events/useEventFilters.js";
import usePagination from "../hooks/pagination/usePagination.js";

import MyEventsViewTabs from "../components/events/MyEventsViewTabs.jsx";
import EventCard from "../components/events/EventCard.jsx";
import EventsFilterCard from "../components/events/EventsFilterCard.jsx";

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

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Stores events returned by the backend
    const [events, setEvents] = useState([]);

    // Controls current My Events view
    const [activeView, setActiveView] = useState("created");

    // Controls loading screen
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
       My events data fetching
       Fetches current user events with:
       - view
       - filters
       - sorting
       - pagination
    ========================= */

    const loadData = useCallback(
        async (customFilters = getDefaultEventFilters(), customPage = 1, customView = activeView) => {
            try {
                setError("");

                let { sortBy, order, ...filterValues } = customFilters;

                const isHistoryView = customView.includes("History");

                if (!sortBy) {
                    sortBy = "startDateTime";
                    order = isHistoryView ? "desc" : "asc";
                }

                const response = await getMyEvents({
                    view: customView,
                    ...filterValues,
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
        [activeView, pagination.pageSize]
    );


    /* =========================
       Event filters
       Shared filter state and handlers
    ========================= */

    const {filters, setFilters, showFilters, setShowFilters, sortLabels, isCurrentWeekendFilterActive, handleFilterChange, handleFilterSubmit, handleSortChange, handleResetFilters, handleTodayFilter, handleWeekendFilter } = useEventFilters({
        activeView: activeView.includes("History") ? "archives" : "upcoming",
        loadData: (nextFilters, nextPage) =>
            loadData(nextFilters, nextPage, activeView),
        resetPage: () =>
            setPagination((prev) => ({
                ...prev,
                page: 1
            })),
    });

    const emptyState = getEventsEmptyState({filters, activeView: activeView.includes("History") ? "archives" : "upcoming"});


    /* =========================
       Pagination controls
    ========================= */

    const { handlePreviousPage, handleNextPage } = usePagination({
        page: pagination.page,
        totalPages: pagination.totalPages,
        onPageChange: (nextPage) => loadData(filters, nextPage, activeView),
    });

    /* =========================
       Initial data loading
    ========================= */

    useEffect(() => {
        loadData(getDefaultEventFilters(), 1, "created");
    }, [loadData]);


    /* =========================
       Feedback cleanup
       Clears success/error messages automatically
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
       Handles leave operation
    ========================= */
    
    const { handleLeaveEvent } = useEventActionsWithConfirm({loadData, setMessage, setError, getRoleByEventId});


    /* =========================
       View content
       Returns title, subtitle and empty message
       based on the selected tab
    ========================= */

    const getViewContent = () => {
        switch (activeView) {
            case "created":
                return {
                    title: "Created Events",
                    subtitle: "Events you created as organizer.",
                    empty: "You haven’t created any events yet."
                };

            case "createdHistory":
                return {
                    title: "Created History",
                    subtitle: "Explore past events you created.",
                    empty: "No past created events."
                };

            case "joined":
                return {
                    title: "Joined Events",
                    subtitle: "Events you joined.",
                    empty: "You haven’t joined any events yet."
                };

            case "joinedHistory":
                return {
                    title: "Joined History",
                    subtitle: "Explore past events you joined.",
                    empty: "No past joined events."
                };

            default:
                return {
                    title: "My Events",
                    subtitle: "",
                    empty: "No events found."
                };
        }
    };

    const viewContent = getViewContent();


    /* =========================
       View handler
       Changes active tab and reloads first page
    ========================= */

    const handleViewChange = async (nextView) => {
        const nextFilters = nextView.includes("History") ? { ...filters, date: "", startDate: "", endDate: "" } : filters;

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

                    {pagination.totalPages > 1 && (<span className="results-page-info">Page {pagination.page} of {pagination.totalPages}</span>)}
                </div>

                <p className="section-subtitle">{viewContent.subtitle}</p>

                <div className="events-view-bar">
                    <MyEventsViewTabs
                        activeView={activeView}
                        onChange={handleViewChange}
                    />

                    {!activeView.includes("History") && (
                        <div className="events-quick-actions">
                            <Button type="button" variant={ filters.date ? "filter-active" : "outline-primary"} onClick={handleTodayFilter}>Today</Button>
                            <Button type="button" variant={ isCurrentWeekendFilterActive(filters) ? "filter-active" : "outline-primary"} onClick={handleWeekendFilter}>This Weekend</Button>
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