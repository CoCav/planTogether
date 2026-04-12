import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllEvents } from "../api/eventApi";
import { getNormalizedEvents } from "../utils/normalize.js";
import { useAuth } from "../context/useAuth.js";

export default function HomePage() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);

    useEffect(() => {
    const fetchEvents = async () => {
        try {
            const response = await getAllEvents();
            setEvents(getNormalizedEvents(response));    
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    fetchEvents();
  }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>PlanTogether</h1>

            <p>Organize and join events with your friends 🚀</p>

            {!user ? (

                <div style={{ marginTop: "20px" }}>
                    <Link to="/login">
                        <button>Login</button>
                    </Link>

                    <Link to="/register">
                        <button style={{ marginLeft: "10px" }}>Register</button>
                    </Link>
                </div>
                
            ) : (

                <div style={{ marginTop: "20px" }}>
                    <p>You are connected as {user.name}</p>
                    <Link to="/events">
                        <button>Go to Events</button>
                    </Link>
                </div>
            )}

            <div style={{ marginTop: "20px" }}>
                <h2>Upcoming Events</h2>

                {events.length === 0 ? (
                    <p>No events yet</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {events.slice(0, 5).map((event) => (
                        <li key={event.id} style={{ marginBottom: "10px" }}>
                            <strong>{event.title}</strong> - {event.description}
                        </li>
                    ))}
                    </ul>
                )}
            </div>
        
            <Link to="/events">
                <button>View all events</button>
            </Link>
        </div>  
    );
}