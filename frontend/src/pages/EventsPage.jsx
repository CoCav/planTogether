import { useEffect, useState } from "react";"../utils/dataLoader";
import { getAllEvents, getMyMemberships, joinEvent, leaveEvent } from "../api/eventApi";
import { Link } from "react-router-dom";


export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [myEventIds, setMyEventIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const fetchEvents = async () => {
        const response = await getAllEvents();
        return response.data.events || response.data;
    };

  const fetchMyMemberships = async () => {
    const response = await getMyMemberships();
    return response.data.events || response.data;
    
    
  };

    const loadData = async () => {
    try {
        setError("");

        const [eventsData, membershipsData] = await Promise.all([
        fetchEvents(),
        fetchMyMemberships(),]);

        setEvents(eventsData);

        const joinedIds = membershipsData.map((item) => item.id || item.eventId);
        setMyEventIds(joinedIds);

        console.log("Events:", eventsData);
        console.log("My memberships:", membershipsData);
        console.log("My event IDs:", joinedIds);
    } catch (error) {
        console.error("Error loading data:", error);
        setError("❌ Failed to load events");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

    if (loading) return <p>Loading events...</p>;

    return (
    <div>
        <h1>Events</h1>

        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <Link to="/events/create">Create Event</Link>

        {events.length === 0 ? (
        <p>No events found</p>
        ) : (
            <ul>
                {events.map((event) => {
                const isMember = myEventIds.includes(event.id);

                return (
                    <li key={event.id}>
                        <strong>{event.title}</strong> - {event.description}
                        <div>
                            {isMember ? (
                            <button onClick={() => handleLeave(event.id)}>Leave</button>
                            ) : (
                            <button onClick={() => handleJoin(event.id)}>Join</button>)}
                        </div>
                    </li>);
                })}
            </ul>
        )}
    </div>);
}