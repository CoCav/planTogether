import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyEvents } from "../api/eventMembershipApi";
import { getMyEventsWithRole } from "../features/events/normalizeData";
import useEventActionsWithConfirm from "../hooks/useEventActionsWithConfirm";

import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import EventCard from "../components/ui/EventCard";
import MyEventsViewTabs from "../components/ui/MyEventsViewTabs.jsx";
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

    // View state: controls active event view (created / created history / joined / joined history)
    const [activeView, setActiveView] = useState("created");


    /* =========================
     Derived event collections
       Split events depending on the user's role
    ========================= */
    const createdEvents = myEvents.filter((event) => event.role === "organizer" && event.status !== "past");
    const createdEventsHistory = myEvents.filter((event) => event.role === "organizer" && event.status === "past");
    const joinedEvents = myEvents.filter((event) => event.role !== "organizer" && event.status !== "past");
    const joinedEventsHistory = myEvents.filter((event) => event.role !== "organizer" && event.status === "past");


    /* =========================
     Current view data
       Returns the event list matching the selected tab
    ========================= */
    const getCurrentEvents = () => {
        switch (activeView) {
            case "created":
                return createdEvents;
            case "createdHistory":
                return createdEventsHistory;
            case "joined":
                return joinedEvents;
            case "joinedHistory":
                return joinedEventsHistory;
            default:
                return [];
        }
    };

    const currentEvents = getCurrentEvents();


    /* =========================
     Current view labels
       Returns title, subtitle and empty message for the selected tab
    ========================= */
    const getCurrentViewContent = () => {
        switch (activeView) {
            case "created":
                return {
                    title: "Created Events",
                    subtitle: "Events you created as organizer.",
                    emptyMessage: "No created events."
                };
            case "createdHistory":
                return {
                    title: "Created History",
                    subtitle: "Explore past events you created.",
                    emptyMessage: "No past created events."
                };
            case "joined":
                return {
                    title: "Joined Events",
                    subtitle: "Events you joined as participant or co-organizer.",
                    emptyMessage: "No joined events."
                };
            case "joinedHistory":
                return {
                    title: "Joined History",
                    subtitle: "Explore past events you joined.",
                    emptyMessage: "No past joined events."
                };
            default:
                return {
                    title: "My Events",
                    subtitle: "View your events.",
                    emptyMessage: "No events found."
                };
        }
    };

    const viewContent = getCurrentViewContent();

    
    /* =========================
     Data loading
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
                <>
                    {/* =========================
                        EVENTS HEADER (like EventsPage)
                    ========================= */}
                    <div className="events-header">
                        <div className="events-header-top">
                            <h2 className="section-title">
                                {viewContent.title}
                                <span className="results-count">({currentEvents.length})</span>
                            </h2>
                        </div>

                        <p className="section-subtitle">{viewContent.subtitle}</p>

                        <div className="events-view-bar">
                            <MyEventsViewTabs activeView={activeView} onChange={setActiveView}/>
                        </div>
                    </div>

                    {/* =========================
                        EVENTS LIST
                    ========================= */}
                    <section className="events-section">
                        {currentEvents.length === 0 ? (
                            <EmptyState>{viewContent.emptyMessage}</EmptyState>
                        ) : (
                            <div className="events-grid">
                                {currentEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        user={true}
                                        role={event.role}
                                        onLeave={handleLeaveEvent}
                                        variant="my-events"
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}