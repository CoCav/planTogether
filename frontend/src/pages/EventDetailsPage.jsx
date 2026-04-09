import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEventById } from "../api/eventApi";

export default function EventDetailsPage() {
    const { eventId } = useParams();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await getEventById(eventId);
                setEvent(response.data.event);
                
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        };

    fetchEvent();}, [eventId]);

    if (loading) return <p>Loading...</p>;

    if (!event) return <p>Event not found</p>;

    return (
        <div>
            <h1>{event.title}</h1>
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Theme:</strong> {event.theme}</p>
            <p><strong>Type:</strong> {event.type}</p>
        </div>
    );
}