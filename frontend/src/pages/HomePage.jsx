import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import { getAllEvents } from "../api/eventApi"
import { getMyEvents } from "../api/eventMembershipApi";
import { getNormalizedEvents, getMyEventsWithRole } from "../features/events/normalizeData.js";
import useEventActionsWithConfirm from "../hooks/useEventActionsWithConfirm";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EventCard from "../components/ui/EventCard.jsx";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import Alert from "../components/ui/Alert";

export default function HomePage() {
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Events preview state: stores homepage event preview
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    // Membership role state: stores current user role by event ID
    const [myEvents, setMyEvents] = useState({});


    /* =========================
     Load homepage data
    ========================= */

    // Fetches visible events and current user memberships
    const loadData = async () => {
        try {
            setError("");
            setLoadingEvents(true);

            const response = await getAllEvents();
            setEvents(getNormalizedEvents(response));

            if (user) {
                const membershipMap = await fetchMyEvents();
                setMyEvents(membershipMap);
            } else {
                setMyEvents({});
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            setError("❌ Failed to load events");
        } finally {
            setLoadingEvents(false);
        }
    };

    // Fetches current user memberships and returns a role map indexed by event ID
      const fetchMyEvents = async () => {
        if (!user) return {};
  
        const response = await getMyEvents();
        const membershipEvents = getMyEventsWithRole(response);
  
        const membershipMap = {};
        membershipEvents.forEach((item) => {membershipMap[item.id] = item.role});
        return membershipMap;
    };

    // Load initial user data or reload data when authentication state change
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

    const MAX_HOME_EVENTS = 4;
    const previewEvents = events.slice(0, MAX_HOME_EVENTS);

    /* =========================
     Derived helper
        returns current user's role for a given event
    ========================= */
    const getRoleByEventId = (eventId) => myEvents[eventId] || null;
    
    /* =========================
     Event membership actions
        Provides join / leave handlers with shared UX logic
    ========================= */
    const { handleJoinEvent, handleLeaveEvent } = useEventActionsWithConfirm({
        loadData,
        setMessage,
        setError,
        getRoleByEventId,
    });


    /* =========================
       Main render
    ========================= */

    return (
        <div className="container page-section">

            {/* =========================
                Hero section
            ========================= */}
            <section className="hero-section">
                <div className="hero-container">

                     <div className="hero-top-row">
                        <p className="hero-eyebrow">Plan events together</p>
                    </div>

                    <div className="hero-content">
                        <h1 className="hero-title">Organize, join, and manage events with ease</h1>
                        <p className="hero-description">PlanTogether helps you create events, invite participants, manage roles, and keep everything organized in one place.</p>

                        <div className="hero-actions">
                            <Link to="/events">
                                <Button>Browse Events</Button>
                            </Link>

                            {user ? (
                                <Link to="/events/create">
                                    <Button variant="outline">Create Event</Button>
                                </Link>
                            ) : (
                                <Link to="/register">
                                    <Button variant="outline">Create Account</Button>
                                </Link>
                            )}
                        </div>
                    </div>

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
                Recently added events preview
            ========================= */}
            <section className="home-section">
                <div className="section-header">
                    <h2 className="section-title">Latest Events</h2>
                    <p className="section-subtitle">Discover the most recently created events on PlanTogether.</p>
                </div>

                {error && <Alert type="danger">{error}</Alert>}

                {loadingEvents ? (
                    <LoadingState>Loading events...</LoadingState>
                ) : previewEvents.length === 0 ? (
                    <EmptyState>No events yet.</EmptyState>
                ) : (
                    <div className="event-list">
                        {previewEvents.map((event) => (
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
            </section>
        </div>
    );
}