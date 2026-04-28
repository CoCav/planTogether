import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { getMyEvents } from "../api/eventMembershipApi";
import { getMyEventsWithRole } from "../features/events/normalizeData";
import { getDefaultEventFilters, EVENT_SORT_MAP, getSortLabels, getTodayEventFilters, getWeekendEventFilters, isCurrentWeekendFilterActive } from "../features/events/eventFilters";

import useEventActionsWithConfirm from "../hooks/events/useEventActionsWithConfirm";
import usePagination from "../hooks/pagination/usePagination";

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
   Displays paginated events created or joined by the user
   Uses backend filtering, sorting and pagination
================================================== */

export default function MyEventsPage() {
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Events list state: stores current page events
    const [events, setEvents] = useState([]);

    // Loading state: controls loading screen while events are fetched
    const [loading, setLoading] = useState(true);

    // View state: controls active event view
    const [activeView, setActiveView] = useState("created");

    // Filters state: controls all event filtering inputs
    const [filters, setFilters] = useState(getDefaultEventFilters);

    // Filters visibility state: controls whether filter form is expanded or collapsed
    const [showFilters, setShowFilters] = useState(false);

    /* =========================
     Pagination state
        Controls current page and page size
    ========================= */

    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 4,
        totalPages: 1,
        totalEvents: 0
    });

    /* =========================
     Derived helpers
    ========================= */

    const isHistoryView = activeView.includes("History");

    const sortLabels = getSortLabels(isHistoryView ? "archives" : "upcoming");

    const getRoleByEventId = (eventId) =>
        events.find((event) => event.id === eventId)?.role || null;

    /* =========================
     Data loading
        Fetches events for the selected view,
        page, filters and sorting
    ========================= */

    const fetchMyEvents = async (customPage = pagination.page, customView = activeView, customFilters = filters) => {
        try {
            setError("");

            let { sortBy, order, ...filterValues } = customFilters;

            if (!sortBy) {
                sortBy = "startDateTime";
                order = customView.includes("History") ? "desc" : "asc";
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

            console.log("MY EVENTS PARAMS:", {
    view: customView,
    ...filterValues,
    page: customPage,
    pageSize: pagination.pageSize,
    sortBy,
    order,
});

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
    };

    /* =========================
     Effects
        Handles initial data loading and feedback lifecycle
    ========================= */

    useEffect(() => {
        fetchMyEvents(1, activeView, filters);
    }, []);

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
     Event actions
        Provides shared leave behavior
    ========================= */

    const { handleLeaveEvent } = useEventActionsWithConfirm({loadData: fetchMyEvents, setMessage, setError, getRoleByEventId});

    /* =========================
     Filter handlers
        Keeps filters, pagination and backend data in sync
    ========================= */

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFilterSubmit = async (e) => {
        e.preventDefault();

        const nextFilters = {
            ...filters,
            sortBy: filters.sortBy || "startDateTime",
            order: filters.order || (isHistoryView ? "desc" : "asc")
        };

        setFilters(nextFilters);

        setPagination((prev) => ({
            ...prev,
            page: 1
        }));

        await fetchMyEvents(1, activeView, nextFilters);
    };

    const handleSortChange = (e) => {
        const selected = EVENT_SORT_MAP[e.target.value];

        setFilters((prev) => ({
            ...prev,
            sortBy: selected?.sortBy || "startDateTime",
            order: selected?.order || "asc"
        }));
    };

    const handleResetFilters = async () => {
        const resetFilters = getDefaultEventFilters();

        setFilters(resetFilters);

        setPagination((prev) => ({
            ...prev,
            page: 1
        }));

        await fetchMyEvents(1, activeView, resetFilters);
    };

    const handleTodayFilter = async () => {
        const isAlreadyActive = Boolean(filters.date);

        const nextFilters = isAlreadyActive
            ? { ...filters, date: "" }
            : getTodayEventFilters(filters);

        setFilters(nextFilters);
        await fetchMyEvents(1, activeView, nextFilters);
    };

    const handleWeekendFilter = async () => {
        const isAlreadyActive = isCurrentWeekendFilterActive(filters);

        const nextFilters = isAlreadyActive
            ? { ...filters, startDate: "", endDate: "" }
            : getWeekendEventFilters(filters);

        setFilters(nextFilters);
        await fetchMyEvents(1, activeView, nextFilters);
    };

    /* =========================
     View handlers
        Updates active tab and reloads first page
    ========================= */

    const handleViewChange = async (nextView) => {
        const nextFilters = nextView.includes("History")
            ? { ...filters, date: "", startDate: "", endDate: "" }
            : filters;

        setActiveView(nextView);
        setFilters(nextFilters);

        setPagination((prev) => ({
            ...prev,
            page: 1
        }));

        await fetchMyEvents(1, nextView, nextFilters);
    };

    /* =========================
     Pagination actions
        Handles previous / next page navigation
    ========================= */

    const { handlePreviousPage, handleNextPage } = usePagination({
        page: pagination.page,
        totalPages: pagination.totalPages,
        onPageChange: (nextPage) => fetchMyEvents(nextPage, activeView, filters)
    });

    /* =========================
     View content
        Returns title, subtitle and empty state message
        matching the active My Events tab
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

            {loading ? (
                <LoadingState>Loading events...</LoadingState>
            ) : (
                <>
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

                            {!isHistoryView && (
                                <div className="events-quick-actions">
                                    <Button type="button" variant={filters.date ? "filter-active" : "outline-primary"} onClick={handleTodayFilter}>Today</Button>
                                    <Button type="button" variant={ isCurrentWeekendFilterActive(filters) ? "filter-active" : "outline-primary"} onClick={handleWeekendFilter}>This Weekend</Button>
                                </div>
                            )}
                        </div>

                        
                    </div>

                    {/* =========================
                        EVENTS LIST
                    ========================= */}
                    <section className="events-section">
                        {events.length === 0 ? (
                            <EmptyState>{viewContent.empty}</EmptyState>
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

                    
                    {/* =========================
                        PAGINATION
                    ========================= */}
                    <Pagination
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        onPrevious={handlePreviousPage}
                        onNext={handleNextPage}
                    />
                </>
            )}
        </div>
    );
}