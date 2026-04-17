import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import { getAllEvents } from "../api/eventApi";
import { getNormalizedEvents } from "../utils/normalize.js";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import Alert from "../components/ui/Alert";

export default function HomePage() {
    const { user } = useAuth();
    const [error, setError] = useState("");

    // Events preview state: stores homepage event preview
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);


    /* =========================
     Load upcoming events
        Fetches a preview list for homepage
    ========================= */

    useEffect(() => {
    const fetchEvents = async () => {
        setError("");
        setLoadingEvents(true);

        try {
            const response = await getAllEvents();
            setEvents(getNormalizedEvents(response));    
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoadingEvents(false);
        }
    };

    fetchEvents();
  }, []);

    const previewEvents = events.slice(0, 5);

    return (
        <div className="container page-section">

            {/* =========================
                Hero section
            ========================= */}
            <section className="hero-section">
                <div className="hero-content">
                    <p className="hero-eyebrow">Plan events together</p>

                    <h1 className="hero-title">Organize, join, and manage events with ease</h1>
                    <p className="hero-description">PlanTogether helps you create events, invite participants, manage roles, and keep everything organized in one place.</p>

                    <div className="hero-actions">
                        <Link to="/events">
                            <Button type="button">Browse Events</Button>
                        </Link>

                        {user ? (
                            <Link to="/events/create">
                                <Button type="button" variant="outline">Create Event</Button>
                            </Link>
                        ) : (
                            <Link to="/register">
                                <Button type="button" variant="outline">Create Account</Button>
                            </Link>
                         )}
                    </div>

                    {user && (
                        <div className="hero-user-badge">
                            You are connected as <strong>{user.name}</strong>
                        </div>
                    )}
                </div>
            </section>

            {/* =========================
                Features section
            ========================= */}
            <section className="home-section">
                <div className="section-header">
                    <h2 className="section-title">Why PlanTogether?</h2>
                    <p className="section-subtitle">Everything you need to manage events collaboratively.</p>
                </div>

                <div className="features-grid">
                    <Card>
                        <h3 className="feature-title">Create and manage events</h3>
                        <p className="feature-text">Set up events quickly with title, date, location, type, and theme.</p>
                    </Card>

                    <Card>
                        <h3 className="feature-title">Join communities easily</h3>
                        <p className="feature-text">Browse events, join what interests you, and leave when needed.</p>
                    </Card>

                    <Card>
                        <h3 className="feature-title">Role-based collaboration</h3>
                        <p className="feature-text">Organizers, co-organizers, and participants each have clear permissions.</p>
                    </Card>

                    <Card>
                        <h3 className="feature-title">Smart filtering</h3>
                        <p className="feature-text">Search by title, description, type, theme, location, and date.</p>
                    </Card>
                </div>
            </section>

            {/* =========================
                Upcoming events preview
            ========================= */}
            <section className="home-section">
                <div className="section-header">
                    <h2 className="section-title">Upcoming Events</h2>
                    <p className="section-subtitle">A quick preview of what’s happening next.</p>
                </div>

                {error && <Alert type="danger">{error}</Alert>}

                {loadingEvents ? (
                    <LoadingState>Loading events...</LoadingState>
                ) : previewEvents.length === 0 ? (
                    <EmptyState>No events yet.</EmptyState>
                ) : (
                    <div className="event-list">
                        {previewEvents.map((event) => (
                            <Card key={event.id} className="event-card">
                                <div className="event-card-header">
                                    <div className="event-card-main">
                                        <Link to={`/events/${event.id}`} className="event-title-link">
                                            <h3 className="event-title">{event.title}</h3>
                                        </Link>

                                        <p className="event-description">{event.description || "No description provided."}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="home-section-actions">
                    <Link to="/events">
                        <Button type="button" variant="outline">View All Events</Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}