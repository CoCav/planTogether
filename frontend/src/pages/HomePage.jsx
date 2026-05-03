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

    /* =========================
       Local state
       Stores page feedback, events, roles and loading state
    ========================= */
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [events, setEvents] = useState([]);
    const [myEvents, setMyEvents] = useState({});
    const [loadingEvents, setLoadingEvents] = useState(true);


    /* =========================
       Data helpers
       Converts membership events into eventId → role map
    ========================= */
    const buildMembershipMap = (membershipEvents = []) => {
        const membershipMap = {};

        membershipEvents.forEach((item) => {
            if (!item || !item.id) return;

            membershipMap[item.id] = item.role;
        });

        return membershipMap;
    };


    /* =========================
       Main data loading
       Fetches latest events and current user roles for cards
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

            if (!user) {
                setMyEvents({});
                return;
            }

            const membershipResponse = await getMyEvents();
            const membershipEvents = getMyEventsWithRole(membershipResponse);

            setMyEvents(buildMembershipMap(membershipEvents));
        } catch (error) {
            console.error("Error fetching homepage events:", error);
            setError("❌ Failed to load events");
        } finally {
            setLoadingEvents(false);
        }
    }, [user]);


    /* =========================
       Initial data loading
       Loads latest homepage events
    ========================= */
    useEffect(() => {
        loadData();
    }, [loadData]);


    /* =========================
       Feedback cleanup
       Automatically clears success and error messages
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
       Role resolution
       Resolves current user's role for each event card
    ========================= */
    const getRoleByEventId = (eventOrId) => {
        if (!user) return null;

        const event = typeof eventOrId === "object" ? eventOrId : events.find((item) => item.id === eventOrId);

        if (!event) return null;

        if (event.creatorId === user.userId) {
            return "organizer";
        }

        return myEvents[event.id] || null;
    };


    /* =========================
       Event actions
       Handles join / leave operations and reloads data
    ========================= */
    const { handleJoinEvent, handleLeaveEvent } = useEventActionsWithConfirm({
        loadData,
        setMessage,
        setError,
        getRoleByEventId
    });


    /* =========================
       Main render
    ========================= */

    return (
        <div className="container page-section">

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
                                role={getRoleByEventId(event)}
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
