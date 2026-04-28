import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getAllEvents, getFilteredEvents } from "../api/eventApi";
import { getMyEvents } from "../api/eventMembershipApi";
import { getNormalizedEvents, getMyEventsWithRole } from "../features/events/normalizeData.js";
import { getDefaultEventFilters, EVENT_SORT_MAP, getSortLabels, getTodayEventFilters, getWeekendEventFilters, isCurrentWeekendFilterActive } from "../features/events/eventFilters";
import useEventActionsWithConfirm from "../hooks/events/useEventActionsWithConfirm.js";
import usePagination from "../hooks/pagination/usePagination.js";
import { fetchAllPaginated } from "../utils/fetchAllPaginated.js";

import Button from "../components/ui/Button";
import EventCard from "../components/ui/EventCard";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import FormField from "../components/ui/FormField";
import EventsViewTabs from "../components/ui/EventsViewTabs.jsx";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";

/* ==================================================
   EVENTS PAGE
   Displays, filters, sorts and paginates events
   Supports all / upcoming / archives views
================================================== */
export default function EventsPage() {
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Events list state: stores all events
    const [events, setEvents] = useState([]);

    // Membership role state: stores current user role by event ID
    const [myEvents, setMyEvents] = useState({});

    // View state: controls active event view (all / upcoming / archives)
    const [activeView, setActiveView] = useState("all");

    // Page loading state: controls loading scren while events are fetched
    const [loading, setLoading] = useState(true);

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

    // Pagination actions : Handles previous / next page navigation
    const { handlePreviousPage, handleNextPage } = usePagination({
        page: pagination.page,
        totalPages: pagination.totalPages,
        onPageChange: (nextPage) => loadData(filters, nextPage),
    });


    /* =========================
     Data loading
        Fetches events, roles and pagination data
    ========================= */

    // Fetches events according to active filters, sorting, pagination and view
    const fetchEvents = async (customFilters = filters, customPage = pagination.page, customView = activeView) => {
        let { sortBy, order, ...filterValues } = customFilters;

        // Converts the active view into a backend status filter
        const status = customView === "upcoming" ? "upcoming" : customView === "archives" ? "past" : "";

        // Apply default sorting depending on active view
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

        // Detects real filters only, excluding sorting fields
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
            totalEvents: response.data.totalEvents || 0,
        };
    };

    // Fetches current user memberships and maps roles by event ID
    const fetchMyEvents = async () => {
        if (!user) return {};

        const membershipEvents = await fetchAllPaginated({
            fetchPage: getMyEvents,
            normalizePage: getMyEventsWithRole,
            pageSize: 10,
        });

        const membershipMap = {};

        membershipEvents.forEach((item) => {
            membershipMap[item.id] = item.role;
        });

        return membershipMap;
    };

    // Fetches events and current user membership data
    const loadData = async (customFilters = filters, customPage = pagination.page, customView = activeView) => {
        try {
            setError("");

            const result = await fetchEvents(customFilters, customPage, customView);

            setEvents(result.events);
            setPagination((prev) => ({
                ...prev,
                page: result.page,
                pageSize: result.pageSize,
                totalPages: result.totalPages,
                totalEvents: result.totalEvents,
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
    };


    /* =========================
     Effects
    ========================= */

    // Loads data on mount and when authentication state changes
    useEffect(() => { loadData() }, [user]);

    // Auto-clear feedback messages after delay
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
     Derived helpers
    ========================= */

    // Returns current user's role for a given event
    const getRoleByEventId = (event) => {
        if (event.creatorId === user?.userId) return "organizer";
        return myEvents[event.id] || null;
    };

    // Events are already filtered by the backend according to active view
    const visibleEvents = events;

    // Dynamic sort labels: adapts sorting labels depending on the active view
    const sortLabels = getSortLabels(activeView);

    // Event membership actions: provides join / leave handlers
    const { handleJoinEvent, handleLeaveEvent } = useEventActionsWithConfirm({ loadData, setMessage, setError, getRoleByEventId });


    /* =========================
     Handlers
    ========================= */

    // Updates filter state on user input
    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Applies current filters and resets pagination
    const handleFilterSubmit = async (e) => {
        e.preventDefault();

        const nextFilters = {
            ...filters,
            sortBy: filters.sortBy || "startDateTime",
            order: filters.order || "asc"
        };

        setFilters(nextFilters);

        setPagination((prev) => ({
            ...prev,
            page: 1
        }));

        await loadData(nextFilters, 1);
    };

    // Updates sorting fields using EVENT_SORT_MAP
    const handleSortChange = (e) => {
        const selected = EVENT_SORT_MAP[e.target.value];

        setFilters((prev) => ({
            ...prev,
            sortBy: selected?.sortBy || "startDateTime",
            order: selected?.order || "asc"
        }));
    };

    // Resets all filters and reloads events
    const handleResetFilters = async () => {
        const resetFilters = getDefaultEventFilters();
        setFilters(resetFilters);

        setPagination((prev) => ({
            ...prev,
            page: 1
        }));

        await loadData(resetFilters, 1);
    };

    // Changes active view and reloads events from page 1
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

    // Applies today's date filter preset
    const handleTodayFilter = async () => {
        const isAlreadyActive = Boolean(filters.date);
        const nextFilters = isAlreadyActive ? { ...filters, date: "" } : getTodayEventFilters(filters);

        setFilters(nextFilters);
        await loadData(nextFilters, 1)
    };

    // Applies this weekend date filter preset
    const handleWeekendFilter = async () => {
        const isAlreadyActive = isCurrentWeekendFilterActive(filters);
        const nextFilters = isAlreadyActive ? { ...filters, startDate: "", endDate: "" } : getWeekendEventFilters(filters);

        setFilters(nextFilters);
        await loadData(nextFilters, 1);
    };

    /* =========================
        Loading render
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

            {/* =========================
            FILTER CARD
        ========================= */}
            <Card className="filter-card">
                {/* Header */}
                <div className="filter-card-header">
                    <div>
                        <h2 className="section-title">Filters</h2>
                        <p className="section-subtitle">Refine events by search, category, location, date, or sorting.</p>
                    </div>

                    <Button type="button" variant="outline" onClick={() => setShowFilters((prev) => !prev)}>{showFilters ? "Hide filters" : "Show filters"}</Button>
                </div>

                {/* Collapsible content */}
                {showFilters && (
                    <>
                        {/* Form */}
                        <form onSubmit={handleFilterSubmit} className="filter-form">
                            <div className="form-grid">

                                <FormField label="Search">
                                    <Input
                                        name="search"
                                        value={filters.search}
                                        onChange={handleFilterChange}
                                        placeholder="Search events..."
                                    />
                                </FormField>

                                <FormField label="Type">
                                    <Input
                                        name="type"
                                        value={filters.type}
                                        onChange={handleFilterChange}
                                        placeholder="Workshop, Meetup..."
                                    />
                                </FormField>

                                <FormField label="Theme">
                                    <Input
                                        name="theme"
                                        value={filters.theme}
                                        onChange={handleFilterChange}
                                        placeholder="Tech, Music..."
                                    />
                                </FormField>

                                <FormField label="Mode">
                                    <Select name="mode" value={filters.mode} onChange={handleFilterChange}>
                                        <option value="">All</option>
                                        <option value="online">Online</option>
                                        <option value="in_person">In person</option>
                                    </Select>
                                </FormField>

                                <FormField label="Location">
                                    <Input
                                        name="location"
                                        value={filters.location}
                                        onChange={handleFilterChange}
                                        placeholder="City or place..."
                                    />
                                </FormField>

                                <FormField label="Date">
                                    <Input
                                        type="date"
                                        name="date"
                                        value={filters.date}
                                        onChange={handleFilterChange}
                                    />
                                </FormField>

                                <FormField label="Start date">
                                    <Input
                                        type="date"
                                        name="startDate"
                                        value={filters.startDate}
                                        onChange={handleFilterChange}
                                    />
                                </FormField>

                                <FormField label="End date">
                                    <Input
                                        type="date"
                                        name="endDate"
                                        value={filters.endDate}
                                        onChange={handleFilterChange}
                                    />
                                </FormField>

                                <FormField label="Sort by">
                                    <Select
                                        name="sortBy"
                                        value={`${filters.sortBy || "startDateTime"}-${filters.order || "asc"}`}
                                        onChange={handleSortChange}
                                    >
                                        {Object.entries(sortLabels).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </Select>
                                </FormField>
                            </div>

                            <div className="form-actions">
                                <Button type="submit">Apply filters</Button>
                                <Button type="button" variant="outline" onClick={handleResetFilters}>Reset</Button>
                            </div>
                        </form>
                    </>
                )}
            </Card>



            {/* =========================
            EVENTS HEADER
        ========================= */}
            <div className="events-header">
                <div className="events-header-top">
                    <h2 className="section-title">
                        {activeView === "archives" ? "Archives" : activeView === "upcoming" ? "Upcoming Events" : "All Events"}
                        <span className="results-count">({pagination.totalEvents})</span>
                    </h2>

                    {pagination.totalPages > 1 && (<span className="results-page-info">Page {pagination.page} of {pagination.totalPages}</span>)}
                </div>

                <p className="section-subtitle">
                    {activeView === "archives" ? "Explore past events."
                        : activeView === "upcoming" ? "Discover upcoming events and plan ahead."
                            : "Browse all events and refine your search."
                    }
                </p>

                <div className="events-view-bar">
                    <EventsViewTabs activeView={activeView} onChange={handleViewChange} />

                    {activeView !== "archives" && (
                        <div className="events-quick-actions">
                            <Button type="button" variant={filters.date ? "filter-active" : "outline-primary"} onClick={handleTodayFilter}>Today</Button>
                            <Button type="button" variant={isCurrentWeekendFilterActive(filters) ? "filter-active" : "outline-primary"} onClick={handleWeekendFilter}>This Weekend</Button>
                        </div>
                    )}

                </div>
            </div>

            {/* =========================
            EVENTS LIST
            ========================= */}
            <section className="events-section">
                {visibleEvents.length === 0 ? (
                    <EmptyState>
                        {filters.date ? "No events are scheduled for today."
                            : filters.startDate || filters.endDate ? "No events are scheduled for this weekend."
                                : activeView === "upcoming" ? "No upcoming events."
                                    : activeView === "archives" ? "No archived events."
                                        : "No events found."}
                    </EmptyState>
                ) : (
                    <div className="events-grid">
                        {visibleEvents.map((event) => (
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

            {/* =========================
            PAGINATION
            ========================= */}
            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <Button type="button" variant="outline" onClick={handlePreviousPage} disabled={pagination.page === 1}>Previous</Button>
                    <span className="pagination-info">Page {pagination.page} of {pagination.totalPages}</span>
                    <Button type="button" variant="outline" onClick={handleNextPage} disabled={pagination.page === pagination.totalPages}>Next</Button>
                </div>
            )}
        </div>
    );
}