import { useEffect, useState } from "react";
import { getAllEvents } from "../api/eventApi";
import { getMyEvents } from "../api/eventMembershipApi.js";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getNormalizedEvents, getMyEventsWithRole } from "../utils/normalize.js";
import  useEventActionsWithConfirm  from "../hooks/useEventActionsWithConfirm.js";
import BackButton from "../components/BackButton.jsx";

export default function EventsPage() {
    const { user } = useAuth();

    const [events, setEvents] = useState([]);
    const [myEventIds, setMyEventIds] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    
    const fetchEvents = async () => {
        const response = await getAllEvents();
        return getNormalizedEvents(response);
    };

    const fetchMyMemberships = async () => {
        const response = await getMyEvents();
        return  getMyEventsWithRole(response);
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
                setMyEventIds({});
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

        const getRoleByEventId = (eventId) => myEventIds[eventId];

        const { handleJoinEvent, handleLeaveEvent } = useEventActionsWithConfirm({
            loadData,
            setMessage,
            setError,
            getRoleByEventId
        })

        const getRoleLabel = (role) => {
            if (role === "organizer") return "👑 Organizer";
            if (role === "co_organizer") return "🛡️ Co-organizer";
            return "👤 Participant";
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

        {events.length === 0 ? (
        <p>No events found</p>
        ) : (
            <ul>
                {events.map((event) => {
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
                                                <button onClick={() => handleLeaveEvent(event.id)}>
                                                    Leave
                                                </button>
                                            </>
                                        )) : (
                                        <button onClick={() => handleJoinEvent(event.id)}>
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