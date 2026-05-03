import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

import { getAllEvents, getFilteredEvents } from "../api/eventApi";
import { getMyEvents } from "../api/eventMembershipApi";

import { getNormalizedEvents, getMyEventsWithRole } from "../features/events/normalizeData.js";
import { getEventsEmptyState } from "../features/events/eventEmptyState.js";
import { getDefaultEventFilters } from "../features/events/eventFilters";

import useEventActionsWithConfirm from "../hooks/events/useEventActionsWithConfirm.js";
import useEventFilters from "../hooks/events/useEventFilters.js";
import usePagination from "../hooks/pagination/usePagination.js";

import { fetchAllPaginated } from "../utils/fetchAllPaginated.js";

import EventsFilterCard from "../components/events/EventsFilterCard";
import EventsViewTabs from "../components/events/EventsViewTabs.jsx";
import EventCard from "../components/events/EventCard.jsx";

import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import Pagination from "../components/ui/Pagination.jsx";

/* ==================================================
   EVENTS PAGE
   Displays and manages events with support for:
   - filtering
   - sorting
   - pagination
   - user participation
================================================== */

export default function EventsPage() {
    const { user } = useAuth();

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Stores events returned by the backend
    const [events, setEvents] = useState([]);

    // Stores current user's role by event ID
    const [myEvents, setMyEvents] = useState({});

    // Controls current event view
    const [activeView, setActiveView] = useState("all");

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
       Event data fetching
       Fetches events with filters, sorting,
       pagination and view-based status
    ========================= */

    const fetchEvents = useCallback(
        async (customFilters = getDefaultEventFilters(), customPage = 1, customView = "all") => {
            let { sortBy, order, ...filterValues } = customFilters;

            const status = customView === "upcoming" ? "upcoming" : customView === "archives" ? "past" : "";

            if (!sortBy) {
                if (customView === "upcoming") {
                    sortBy = "startDateTime";
                    order = "asc";
                } else if (customView === "archives") {
                    sortBy = "startDateTime";
                    order = "desc";
                } else {
                    sortBy = "createdAt";
                    order = "desc";
                }
            }

            const hasActiveFilters = Object.values(filterValues).some((value) => String(value).trim() !== "");

            const params = {
                ...filterValues,
                ...(status && { status }),
                sortBy,
                order,
                page: customPage,
                pageSize: pagination.pageSize
            };

            const response = hasActiveFilters ? await getFilteredEvents(params) : await getAllEvents(params);

            return {
                events: getNormalizedEvents(response),
                page: response.data.page || 1,
                pageSize: response.data.pageSize || pagination.pageSize,
                totalPages: response.data.totalPages || 1,
                totalEvents: response.data.totalEvents || 0
            };
        },
        [pagination.pageSize]
    );

    /* =========================
       User membership fetching
       Builds eventId → role map for the current user
    ========================= */

    const fetchMyEvents = useCallback(async () => {
        if (!user) return {};

        const membershipEvents = await fetchAllPaginated({
            fetchPage: getMyEvents,
            normalizePage: getMyEventsWithRole,
            pageSize: 10
        });

        const membershipMap = {};

        membershipEvents.forEach((item) => {
            if (!item || !item.id) return;

            membershipMap[item.id] = item.role;
        });

        return membershipMap;
    }, [user]);

    /* =========================
       Main data loader
       Combines events, pagination and user roles
    ========================= */

    const loadData = useCallback(
        async (customFilters = getDefaultEventFilters(), customPage = 1, customView = activeView) => {
            try {
                setError("");

                const result = await fetchEvents(customFilters, customPage, customView);
                setEvents(result.events);

                setPagination((prev) => ({
                    ...prev,
                    page: result.page,
                    pageSize: result.pageSize,
                    totalPages: result.totalPages,
                    totalEvents: result.totalEvents
                }));

                if (user) {
                    const membershipMap = await fetchMyEvents();
                    setMyEvents(membershipMap);
                } else {
                    setMyEvents({});
                }
            } catch (error) {
                console.error("Error loading data:", error);
                setError("❌ Failed to load events");
            } finally {
                setLoading(false);
            }
        },
        [activeView, fetchEvents, fetchMyEvents, user]
    );

    /* =========================
       Event filters
       Shared filter state and handlers
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
        activeView, loadData, resetPage: () =>
            setPagination((prev) => ({
                ...prev,
                page: 1
            }))
    });

    const emptyState = getEventsEmptyState({ filters, activeView });

    /* =========================
       Pagination
    ========================= */

    const { handlePreviousPage, handleNextPage } = usePagination({
        page: pagination.page,
        totalPages: pagination.totalPages,
        onPageChange: (nextPage) => loadData(filters, nextPage, activeView)
    });

    /* =========================
       Initial data loading
    ========================= */

    useEffect(() => {
        loadData(getDefaultEventFilters(), 1, "all");
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

    const getRoleByEventId = (event) => {
        if (!user) return null;

        if (event.creatorId === user.userId) {
            return "organizer";
        }

        return myEvents[event.id] || null;
    };

    /* =========================
       Event actions
       Handles join / leave operations
    ========================= */

    const { handleJoinEvent, handleLeaveEvent } = useEventActionsWithConfirm({ loadData, setMessage, setError, getRoleByEventId });

    /* =========================
       View handler
       Changes active view and reloads first page
    ========================= */

    const handleViewChange = async (nextView) => {
        const nextFilters = nextView === "archives" ? { ...filters, date: "", startDate: "", endDate: "" } : filters;

        setActiveView(nextView);
        setFilters(nextFilters);

        setPagination((prev) => ({
            ...prev,
            page: 1
        }));

        await loadData(nextFilters, 1, nextView);
    };

    /* =========================
        Display-ready page data
        Keeps render JSX readable and avoids nested conditions
    ========================= */

    const pageTitle =
        activeView === "archives"
            ? "Archives"
            : activeView === "upcoming"
                ? "Upcoming Events"
                : "All Events";

    const pageSubtitle =
        activeView === "archives"
            ? "Explore past events."
            : activeView === "upcoming"
                ? "Discover upcoming events and plan ahead."
                : "Browse all events and refine your search.";

    const showQuickActions = activeView !== "archives";
    const showPaginationInfo = pagination.totalPages > 1;

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
                    <h1 className="page-title">Events</h1>
                    <p className="page-subtitle">Discover events, join communities, and manage your participation.</p>
                </div>

                <Link to="/events/create" className="btn btn-primary">Create Event</Link>
            </div>

            {!user && (<Alert type="info">🔐 Login to join events and manage your participation.</Alert>)}

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
                        {pageTitle}
                        <span className="results-count">({pagination.totalEvents})</span>
                    </h2>

                    {showPaginationInfo && (
                        <span className="results-page-info">Page {pagination.page} of {pagination.totalPages}</span>
                    )}
                </div>

                <p className="section-subtitle">{pageSubtitle}</p>

                <div className="events-view-bar">
                    <EventsViewTabs
                        activeView={activeView}
                        onChange={handleViewChange}
                    />

                    {showQuickActions && (
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
                        title={emptyState.title}
                        description={emptyState.description}
                    />
                ) : (
                    <div className="events-grid">
                        {events.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                user={user}
                                role={getRoleByEventId(event)}
                                onJoin={handleJoinEvent}
                                onLeave={handleLeaveEvent}
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
