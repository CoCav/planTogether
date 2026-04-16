import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getAllEvents, getFilteredEvents } from "../api/eventApi";
import { getMyEvents } from "../api/eventMembershipApi";
import { getNormalizedEvents, getMyEventsWithRole } from "../utils/normalize";
import useEventActionsWithConfirm from "../hooks/useEventActionsWithConfirm";
import BackButton from "../components/BackButton";

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

    const getRoleLabel = (role) => {
        if (role === "organizer") return "👑 Organizer";
        if (role === "co_organizer") return "🛡️ Co-organizer";
        return "👤 Participant";
    };

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

    if (loading) return <p>Loading events...</p>;

    return (
        <div>
            <BackButton label="← Back to Home" />
            <h1>Events</h1>

            {!user && <p>🔐 Login to join events</p>}

            {message && <p style={{ color: "green" }}>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <Link to="/events/create">Create Event</Link>

            <form onSubmit={handleFilterSubmit} style={{ marginTop: "20px", marginBottom: "20px" }}>
                <h2>Filter Events</h2>

                <div style={{ marginBottom: "10px" }}>
                    <label>Search by title</label>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search in title or description"
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Type</label>
                    <input
                        type="text"
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        placeholder="Event type"
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Theme</label>
                    <input
                        type="text"
                        name="theme"
                        value={filters.theme}
                        onChange={handleFilterChange}
                        placeholder="Event theme"
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Location</label>
                    <input
                        type="text"
                        name="location"
                        value={filters.location}
                        onChange={handleFilterChange}
                        placeholder="Event location"
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Exact Date</label>
                    <input
                        type="date"
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Start Date</label>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        disabled={!!filters.date}
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>End Date</label>
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        disabled={!!filters.date}
                    />
                </div>

                <button type="submit">Apply Filters</button>
                <button
                    type="button"
                    onClick={handleResetFilters}
                    style={{ marginLeft: "10px" }}
                >
                    Reset
                </button>
            </form>

            {events.length === 0 ? (
                <p>No events found</p>
            ) : (
                <ul>
                    {events.map((event) => {
                    const role = myEvents[event.id];
                    const isMember = !!role;

                    return (
                        <li key={event.id}>
                            <Link to={`/events/${event.id}`}>
                            <strong>{event.title}</strong>
                            </Link>{" "}
                            - {event.description}

                            <div>
                                {user && role && (
                                    <span style={{ marginRight: "10px" }}>
                                        {getRoleLabel(role)}
                                    </span>
                                )}

                                {user &&
                                    (isMember ? (
                                        role === "organizer" ? (
                                            <span style={{ color: "gray" }}>
                                                You cannot leave your own event
                                             </span>
                                        ) : (
                                            <>
                                                <span style={{ marginRight: "10px", color: "green" }}>
                                                    ✅ Joined
                                                </span>
                                                <button onClick={() => handleLeaveEvent(event.id)}>
                                                    Leave
                                                </button>
                                            </>
                                        )
                                    ) : (
                                        <button onClick={() => handleJoinEvent(event.id)}>
                                            Join
                                        </button>
                                    )
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        )}
    </div>
  );
}