import { useEffect, useState } from "react";
import { getAllEvents, getMyMemberships, joinEvent, leaveEvent } from "../api/eventApi";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getNormalizedEvents, getMembershipEvents } from "../utils/normalize.js";


export default function EventsPage() {
    const { user } = useAuth();

    const [events, setEvents] = useState([]);
    const [myEventIds, setMyEventIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    
    const fetchEvents = async () => {
        const response = await getAllEvents();
        return getNormalizedEvents(response);
    };

    const fetchMyMemberships = async () => {
        const response = await getMyMemberships();
        return getMembershipEvents(response);
    };

    const loadData = async () => {
        try {
            setError("");

            const eventsData = await fetchEvents();
            setEvents(eventsData);

            if (user) {
                const membershipsData = await fetchMyMemberships();   
                const membershipMap = {};

                membershipsData.forEach((item) => { membershipMap[item.id] = item.role });
                setMyEventIds(membershipMap)

            } else {
                setMyEventIds([]);
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

        const handleJoin = async (eventId) => {
            try {
                setError("");
                setMessage("");

                await joinEvent(eventId);
                setMessage("✅ Successfully joined event!");
                await loadData();
            } catch (error) {
                setError("❌ Unable to join event (maybe already joined)");
                console.error("Error joining event:", error);
            }
        };

        const handleLeave = async (eventId) => {

            const role = myEventIds[eventId];

            if (role === "organizer") {
                setError("❌ Organizers cannot leave their own event");
                return;
            }

            try {
                setError("");
                setMessage("");

                await leaveEvent(eventId);
                setMessage("👋 Successfully left event!");
                await loadData();
            } catch (error) {
                setError("❌ Unable to leave event");
                console.error("Error leaving event:", error);
            
            }
        };

        const getRoleLabel = (role) => {
            if (role === "organizer") return "👑 Organizer";
            if (role === "co_organizer") return "🛡️ Co-organizer";
            return "👤 Participant";
        };
        
        if (loading) return <p>Loading events...</p>;


    return (
    <div>
        <h1>Events</h1>

        {!user && <p>🔐 Login to join events</p>}

        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <Link to="/events/create">Create Event</Link>

        {events.length === 0 ? (
        <p>No events found</p>
        ) : (
            <ul>
                {events.map((event) => {
                {/* const isMember = myEventIds.includes(event.id); */}
                const role = myEventIds[event.id];
                const isMember = !!role;

                return (
                    <li key={event.id}>
                        <Link to={`/events/${event.id}`}>
                            <strong>{event.title}</strong>
                        </Link> - {event.description}
                        <div>
                            <div>
                                {user && role && (
                                    <span style={{ marginRight: "10px" }}>
                                        {getRoleLabel(role)}
                                    </span>
                                )}

                                {user && (
                                    <div>
                                        {isMember ? (
                                            role === "organizer" ? (
                                                <span style={{ color: "gray" }}>You cannot leave your own event</span>
                                            ) : (
                                            <>
                                                <span style={{ marginRight: "10px", color: "green" }}>
                                                    ✅ Joined
                                                </span>
                                                <button onClick={() => handleLeave(event.id)}>
                                                    Leave
                                                </button>
                                            </>
                                        )) : (
                                        <button onClick={() => handleJoin(event.id)}>
                                            Join
                                        </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </li>);
                })}
            </ul>
        )}
    </div>);
}