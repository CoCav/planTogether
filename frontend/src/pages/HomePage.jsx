import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import { getAllEvents } from "../api/eventApi";
import { getMyEvents } from "../api/eventMembershipApi";
import { getNormalizedEvents, getMyEventsWithRole } from "../features/events/normalizeData.js";

import useEventActionsWithConfirm from "../hooks/events/useEventActionsWithConfirm.js";

import EventCard from "../components/events/EventCard.jsx";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import Alert from "../components/ui/Alert";

const MAX_HOME_EVENTS = 4;

/* ==================================================
   HOME PAGE
   Displays the landing page with:
   - hero section
   - feature highlights
   - latest events preview
================================================== */

export default function HomePage() {
    const { user } = useAuth();

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Stores latest events shown on the homepage
    const [events, setEvents] = useState([]);

    // Stores current user's role by event ID
    const [myEvents, setMyEvents] = useState({});

    // Controls latest events loading state
    const [loadingEvents, setLoadingEvents] = useState(true);


    /* =========================
       User membership fetching
       Builds eventId → role map for EventCard
    ========================= */

    const fetchMyEvents = useCallback(async () => {
        if (!user) return {};

        const response = await getMyEvents();
        const membershipEvents = getMyEventsWithRole(response);

        const membershipMap = {};

        membershipEvents.forEach((item) => {
            membershipMap[item.id] = item.role;
        });

        return membershipMap;
    }, [user]);


    /* =========================
       Homepage data loading
       Fetches latest events and user roles
    ========================= */

    const loadData = useCallback(async () => {
        try {
            setError("");
            setLoadingEvents(true);

            const response = await getAllEvents({
                page: 1,
                pageSize: MAX_HOME_EVENTS,
                sortBy: "createdAt",
                order: "desc"
            });

            setEvents(getNormalizedEvents(response));

            if (user) {
                const membershipMap = await fetchMyEvents();
                setMyEvents(membershipMap);
            } else {
                setMyEvents({});
            }
        } catch (error) {
            console.error("Error fetching homepage events:", error);
            setError("❌ Failed to load events");
        } finally {
            setLoadingEvents(false);
        }
    }, [user, fetchMyEvents]);


    /* =========================
       Homepage data lifecycle
       Reloads preview data when auth state changes
    ========================= */

    useEffect(() => {
        loadData();
    }, [loadData]);


    /* =========================
       Feedback cleanup
       Clears success/error messages automatically
    ========================= */

    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => {
                setMessage("");
                setError("");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [message, error]);


    /* =========================
       Derived helpers
       Computes event role for the current user
    ========================= */

    const getRoleByEventId = (eventId) => myEvents[eventId] || null;


    /* =========================
       Event actions
       Handles join / leave operations
    ========================= */

    const { handleJoinEvent, handleLeaveEvent } = useEventActionsWithConfirm({loadData, setMessage, setError, getRoleByEventId});


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
                Latest events preview
            ========================= */}
            <section className="home-section">
                <div className="section-header">
                    <h2 className="section-title">Latest Events</h2>
                    <p className="section-subtitle">Discover the most recently created events on PlanTogether.</p>
                </div>

                {message && <Alert type="success">{message}</Alert>}
                {error && <Alert type="danger">{error}</Alert>}

                {loadingEvents ? (
                    <LoadingState>Loading events...</LoadingState>
                ) : events.length === 0 ? (
                    <EmptyState>No events yet.</EmptyState>
                ) : (
                    <div className="event-list">
                        {events.map((event) => (
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