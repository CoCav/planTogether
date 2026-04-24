import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getAllEvents, getFilteredEvents } from "../api/eventApi";
import { getMyEvents } from "../api/eventMembershipApi";
import { getNormalizedEvents, getMyEventsWithRole } from "../features/events/normalizeData.js";
import { getDefaultEventFilters, EVENT_SORT_MAP, getTodayEventFilters, getWeekendEventFilters } from "../features/events/eventFilters";
import useEventActionsWithConfirm from "../hooks/useEventActionsWithConfirm";

import Button from "../components/ui/Button";
import EventCard from "../components/ui/EventCard";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import FormField from "../components/ui/FormField";
import EventViewTabs from "../components/ui/EventViewTabs.jsx";
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
     Data loading
        Fetches events, roles and pagination data
    ========================= */

    // Fetches events according to active filters, sorting, pagination and view
    const fetchEvents = async (customFilters = filters, customPage = pagination.page, customView = activeView) => {
        const { sortBy, order, ...filterValues } = customFilters;

        // Converts the active view into a backend status filter
        const status = customView === "upcoming" ? "upcoming" : customView === "archives" ? "past" : "";

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

        const response = await getMyEvents();
        const membershipEvents = getMyEventsWithRole(response);

        const membershipMap = {};
        membershipEvents.forEach((item) => {membershipMap[item.id] = item.role});
        return membershipMap;
    };

    // Fetches events and current user membership data
    const loadData = async (customFilters = filters, customPage = pagination.page, customView = activeView) => {
        try {
            setError("");
            setLoading(true);

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
    useEffect(() => {loadData()}, [user]);

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
    const getRoleByEventId = (eventId) => myEvents[eventId] || null;

    // Events are already filtered by the backend according to active view
    const visibleEvents = events;
 

    /* =========================
     Event membership actions
        Provides join / leave handlers with shared UX logic
    ========================= */
    const { handleJoinEvent, handleLeaveEvent } = useEventActionsWithConfirm({loadData, setMessage, setError, getRoleByEventId });


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

        setPagination((prev) => ({
            ...prev,
            page: 1
        }));
        
        await loadData(filters, 1);
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
        setActiveView(nextView);

        setPagination((prev) => ({
            ...prev,
            page: 1
        }));

        await loadData(filters, 1, nextView);
    };

    // Pagination: loads previous page
    const handlePreviousPage = async () => {
        if (pagination.page <= 1) return;
        await loadData(filters, pagination.page - 1);
    };

    // Pagination: loads next page
    const handleNextPage = async () => {
        if (pagination.page >= pagination.totalPages) return;
        await loadData(filters, pagination.page + 1);
    };

    // Applies today's date filter preset
    const handleTodayFilter = async () => {
        const nextFilters = getTodayEventFilters(filters);
        setFilters(nextFilters);
        await loadData(nextFilters);
    };

    // Applies this weekend date filter preset
    const handleWeekendFilter = async () => {
        const nextFilters = getWeekendEventFilters(filters);
        setFilters(nextFilters);
        await loadData(nextFilters);
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

        <Card className="filter-card">
            <div className="section-header">
                <h2 className="section-title">Filter Events</h2>
                <p className="section-subtitle">Search by keyword, type, theme, mode, location, or date range.</p>
            </div>

              <div className="filter-shortcuts">
                    <Button type="button" variant={filters.date ? "filter-active" : "outline-primary"} onClick={handleTodayFilter}>Today</Button>
                    <Button type="button" variant={filters.startDate ? "filter-active" : "outline-primary"} onClick={handleWeekendFilter}>This weekend</Button>
                </div>

            <form onSubmit={handleFilterSubmit} className="filter-form">
                <div className="form-grid">
                    <FormField label="Search by title or description">
                        <Input 
                            type="text" 
                            name="search" 
                            value={filters.search} 
                            onChange={handleFilterChange} 
                            placeholder="Search in title or description"
                        />
                    </FormField>

                    <FormField label="Type">
                        <Input
                            type="text"
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            placeholder="Event type"
                        />
                    </FormField>

                    <FormField label="Theme">
                        <Input
                            type="text"
                            name="theme"
                            value={filters.theme}
                            onChange={handleFilterChange}
                            placeholder="Event theme"
                        />
                    </FormField>

                    <FormField label="Mode">
                        <Select name="mode" value={filters.mode} onChange={handleFilterChange}>
                            <option value="">All modes</option>
                            <option value="in_person">In person</option>
                            <option value="online">Online</option>
                        </Select>
                    </FormField>

                    <FormField label="Location">
                        <Input
                            type="text"
                            name="location"
                            value={filters.location}
                            onChange={handleFilterChange}
                            placeholder="Event location"
                        />
                    </FormField>

                    <FormField label="Exact date">
                        <Input
                            type="date"
                            name="date"
                            value={filters.date}
                            onChange={handleFilterChange}
                            disabled={!!filters.startDate || !!filters.endDate}
                        />
                    </FormField>

                    <FormField label="Start date">
                        <Input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            disabled={!!filters.date}
                        />
                    </FormField>

                    <FormField label="End date">
                        <Input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            disabled={!!filters.date}
                        />
                    </FormField>

                    <FormField label="Sort events">
                        <Select name="sortBy" value={`${filters.sortBy}-${filters.order}`} onChange={handleSortChange}>
                            <option value="startDateTime-asc">Upcoming first</option>
                            <option value="startDateTime-desc">Farthest first</option>
                            <option value="title-asc">Title A-Z</option>
                            <option value="title-desc">Title Z-A</option>
                        </Select>
                    </FormField>
                </div>

                <div className="form-actions">
                    <Button type="submit">Apply Filters</Button>
                    <Button type="button" variant="outline" onClick={handleResetFilters}>Reset</Button>
                </div>
            </form>
        </Card>

        {events.length === 0 ? (
            <Card>
                <EmptyState>No events found.</EmptyState>
            </Card>
            ) : (
                <>
                    <div className="results-summary">
                        <p className="results-count">{pagination.totalEvents} Event{pagination.totalEvents > 1 ? "s" : ""} have been found !</p>
                        {pagination.totalPages > 1 && (<p className="results-page-info">Showing page {pagination.page} of {pagination.totalPages}</p>)}
                    </div>
            

                    {/* Event tabs navigation */}
                    <EventViewTabs
                        activeView={activeView}
                        onChange={handleViewChange}
                    />

                    {/* Single dynamic section */}
                    <div className="section-header">
                        <h2 className="section-title">{activeView === "archives" ? "Archives" : activeView === "upcoming" ? "Upcoming Events" : "All Events"}</h2>
                        <p className="section-subtitle">{activeView === "archives" ? "Events that have already ended." : activeView === "upcoming" ? "Events that are still open for participation." : "Browse all available events."}</p>
                    </div>

                    {visibleEvents.length === 0 ? (
                        <Card>
                            <EmptyState>{activeView === "archives" ? "No past events found." : "No upcoming events found."}</EmptyState>
                        </Card>
                    ) : (
                        <div className="event-list">
                            {visibleEvents.map((event) => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    user={user}
                                    role={myEvents[event.id] || null}
                                    onJoin={handleJoinEvent}
                                    onLeave={handleLeaveEvent}
                                />
                            ))}
                        </div>
                    )}

                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            <Button type="button" variant="outline" onClick={handlePreviousPage} disabled={pagination.page === 1}>Previous</Button>
                            <span className="pagination-info">Page {pagination.page} of {pagination.totalPages}</span>
                            <Button type="button" variant="outline" onClick={handleNextPage} disabled={pagination.page === pagination.totalPages}>Next</Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}