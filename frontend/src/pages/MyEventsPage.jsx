import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyEvents } from "../api/eventMembershipApi";
import { getMyEventsWithRole } from "../features/events/normalizeData";
import useEventActionsWithConfirm from "../hooks/useEventActionsWithConfirm";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import Badge from "../components/ui/Badge";

/* ==================================================
   MY EVENTS PAGE
   Displays events created by the user and events joined by the user
================================================== */
export default function MyEventsPage() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Events state: stores all user-related events
    const [myEvents, setMyEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);


    /* =========================
     Derived event collections
       Split events depending on the user's role
    ========================= */
    const createdEvents = myEvents.filter((event) => event.role === "organizer");
    const joinedEvents = myEvents.filter((event) => event.role !== "organizer");


    /* =========================
     Data loading function
       Fetches and normalizes all events related to the current user
    ========================= */
    const fetchMyEvents = async () => {
        try {
            setLoadingEvents(true);

            const response = await getMyEvents();
            const normalizedEvents = getMyEventsWithRole(response);
            setMyEvents(normalizedEvents);
        } catch (error) {
            console.error("Error loading my events:", error);
            setError("Unable to load your events");
        } finally {
            setLoadingEvents(false);
        }
    };


    /* =========================
     Effects
    ========================= */

    // Load user events on page mount
    useEffect(() => {
        fetchMyEvents();
    }, []);

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


    /* =========================
       Helpers
    ========================= */

    // Returns the user's role for a specific event
    const getRoleByEventId = (eventId) =>
        myEvents.find((event) => event.id === eventId)?.role || null;

    // Event actions with confirmation modal
    const { handleLeaveEvent } = useEventActionsWithConfirm({
        loadData: fetchMyEvents,
        setMessage,
        setError,
        getRoleByEventId
    });


    /* =========================
       Main render
    ========================= */

    return (
        <div className="container page-section">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Events</h1>
                    <p className="page-subtitle">View the events you created and the ones you joined.</p>
                </div>
            </div>

            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="danger">{error}</Alert>}

            {loadingEvents ? (
                <LoadingState>Loading events...</LoadingState>
            ) : (
                <div className="details-sections">

                    {/* Created events */}
                    <Card>
                        <div className="section-header">
                            <h2 className="section-title">Created Events</h2>
                            <p className="section-subtitle">Events you created as organizer.</p>
                        </div>

                        {createdEvents.length === 0 ? (
                            <EmptyState>No created events.</EmptyState>
                        ) : (
                            <div className="member-list">
                                {createdEvents.map((event) => (
                                    <div key={event.id} className="member-row">
                                        <div className="member-info">
                                            <Link to={`/events/${event.id}`} className="event-title-link">
                                                <span className="member-name">{event.title}</span>
                                            </Link>

                                            <Badge role="organizer" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Joined events */}
                    <Card>
                        <div className="section-header">
                            <h2 className="section-title">Joined Events</h2>
                            <p className="section-subtitle">Events you joined as participant or co-organizer.</p>
                        </div>

                        {joinedEvents.length === 0 ? (
                            <EmptyState>No joined events.</EmptyState>
                        ) : (
                            <div className="member-list">
                                {joinedEvents.map((event) => (
                                    <div key={event.id} className="member-row">
                                        <div className="member-info">
                                            <Link to={`/events/${event.id}`} className="event-title-link">
                                                <span className="member-name">{event.title}</span>
                                            </Link>

                                            {event.creatorName && (<span className="badge badge-organizer">👑 {event.creatorName}</span>)}

                                            <Badge role={event.role} />
                                        </div>

                                        <div className="member-actions">
                                            <Button type="button" variant="outline-danger" onClick={() => handleLeaveEvent(event.id)}>Leave</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                </div>
            )}
        </div>
    );
}