import { useEffect, useState } from "react";
import { getAllEvents } from "../api/eventApi";
import { Link } from "react-router-dom";

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
        try {
            const response = await getAllEvents();
            setEvents(response.data.events);
            
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
        };

        fetchEvents();
    }, []);

    if (loading) return <p>Loading events...</p>;

    return (
    <div>
        <h1>Events</h1>

        <Link to="/events/create">Create Event</Link>

        {events.length === 0 ? (
            <p>No events found</p>
        ) : (<ul>
            {events.map((event) => (
                <li key={event.id}>
                    <strong>{event.title}</strong> - {event.description}
                </li>))}
            </ul>)}
    </div>
  );
}