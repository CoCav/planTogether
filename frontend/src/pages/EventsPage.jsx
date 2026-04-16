import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getAllEvents, getFilteredEvents } from "../api/eventApi";
import { getMyEvents } from "../api/eventMembershipApi";
import { getNormalizedEvents, getMyEventsWithRole } from "../utils/normalize";
import useEventActionsWithConfirm from "../hooks/useEventActionsWithConfirm";

import BackButton from "../components/ui/BackButton";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import FormField from "../components/ui/FormField";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";

export default function EventsPage() {
    const { user } = useAuth();

    const [events, setEvents] = useState([]);
    const [myEvents, setMyEvents] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        search: "",
        type: "",
        theme: "",
        location: "",
        date: "",
        startDate: "",
        endDate: ""
    });


    // Fetches all events or filtered events depending on active filters.
    const fetchEvents = async (customFilters = filters) => {
        const hasActiveFilters = Object.values(customFilters).some((value) => value.trim() !== "");
        const response = hasActiveFilters ? await getFilteredEvents(customFilters) : await getAllEvents();
        return getNormalizedEvents(response);
    };

  
    // Fetches the current user's events and returns a role map: { [eventId]: role }
    const fetchMyEvents = async () => {
        if (!user) return {};

        const response = await getMyEvents();
        const membershipEvents = getMyEventsWithRole(response);

        const membershipMap = {};
        membershipEvents.forEach((item) => {
            membershipMap[item.id] = item.role;
        });

        return membershipMap;
    };


    // Loads events list and user memberships.
    const loadData = async (customFilters = filters) => {
        try {
            setError("");
            setLoading(true);

            const eventsData = await fetchEvents(customFilters);
            setEvents(eventsData);

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

    useEffect(() => {
        loadData();
    }, [user]);

    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => {
            setMessage("");
            setError("");
        }, 3000);

        return () => clearTimeout(timer);
        }
    }, [message, error]);


   // Returns the current user's role for a given event.
    const getRoleByEventId = (eventId) => myEvents[eventId] || null;

    const { handleJoinEvent, handleLeaveEvent } = useEventActionsWithConfirm({
        loadData,
        setMessage,
        setError,
        getRoleByEventId,
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => {
            if (name === "date") {
                 return {
                    ...prev,
                    date: value,
                    startDate: value ? "" : prev.startDate,
                     endDate: value ? "" : prev.endDate,
                };
            }

            return {
            ...prev,
            [name]: value,};
        });
    };

    // Applies filters using the current filter state.
    const handleFilterSubmit = async (e) => {
        e.preventDefault();

        const formattedFilters = filters.date ? {
            ...filters,
            startDate: "",
            endDate: ""
        } : filters

        await loadData(formattedFilters);
    };

    // Resets all filters and reloads unfiltered events.
    const handleResetFilters = async () => {
        const resetFilters = {
            search: "",
            type: "",
            theme: "",
            location: "",
            date: "",
            startDate: "",
            endDate: ""
        };

        setFilters(resetFilters);
        await loadData(resetFilters);
    };


    if (loading) {
        return (
            <div className="container page-section">
                <BackButton label="← Back to Home" />
                <LoadingState>Loading events...</LoadingState>
            </div>
        );
    }

    return (
    <div className="container page-section">
        <BackButton label="← Back to Home" />

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
                <p className="section-subtitle">Search by keyword, category, location, or date.</p>
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
                <div className="event-list">
                    {events.map((event) => { 
                        const role = myEvents[event.id];
                        const isMember = !!role;

                        return (
                            <Card key={event.id} className="event-card">
                                <div className="event-card-header">
                                    <div className="event-card-main">
                                        <Link to={`/events/${event.id}`} className="event-title-link">
                                            <h3 className="event-title">{event.title}</h3>
                                        </Link>

                                        <p className="event-description">{event.description || "No description provided."}</p>
                                    </div>

                                    {user && role && <Badge role={role} />}
                                </div>

                                <div className="event-card-footer">
                                    {user ? (
                                        isMember ? (
                                            role === "organizer" ? (
                                                 <span className="text-muted">You cannot leave your own event</span>
                                            ) : (
                                                <div className="inline-actions">
                                                    <span className="status-joined">✅ Joined</span>
                                                    <Button type="button" variant="outline" onClick={() => handleLeaveEvent(event.id)}>Leave</Button>
                                                </div>
                                            )
                                        ) : (
                                            <Button type="button" onClick={() => handleJoinEvent(event.id)}>Join</Button>
                                        )
                                    ) : (
                                            <Link to={`/events/${event.id}`} className="btn btn-outline">View Details</Link>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}