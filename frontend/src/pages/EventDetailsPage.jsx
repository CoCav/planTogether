import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getEventById } from "../api/eventApi";
import { getEventMembers, getEventOrganizers } from "../api/eventMembershipApi.js";
import { getNormalizedEvent, getNormalizedMembers, getNormalizedOrganizers } from "../features/events/normalizeData.js";
import { formatEventDateRange, formatCount, formatBe, formatTime } from "../utils/format.js";

import useEventManagementActions from "../hooks/events/useEventManagementActions";
import useEventActionsWithConfirm from "../hooks/events/useEventActionsWithConfirm";
import useEventPermissions from "../hooks/events/useEventPermissions";

import EventMemberList from "../components/events/EventMemberList.jsx";

import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Alert from "../components/ui/Alert.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import PageLoading from "../components/ui/PageLoading.jsx";

/* ==================================================
   EVENT DETAILS PAGE
   Displays detailed information about a single event.

   Supports:
   - join / leave actions
   - edit / delete actions
   - organizer and participant management
   - role-based UI permissions
================================================== */

export default function EventDetailsPage() {
    const { eventId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Stores event details returned by the backend
    const [event, setEvent] = useState(null);

    // Stores event membership collections
    const [members, setMembers] = useState([]);
    const [organizers, setOrganizers] = useState([]);

    // Controls full-page loading state
    const [loading, setLoading] = useState(true);


    /* =========================
       Derived member data
       Computes participants and section counts
    ========================= */

    const participants = members.filter((person) => person.role === "participant");
    const participantCount = event?.participantCount ?? participants.length;
    const organizersCount = organizers.length;


    /* =========================
       Event permissions
       Centralizes role-based UI visibility
    ========================= */

    const { myRole, isPast, canJoin, canLeave, canEdit, canDelete, canPromote, canDemote, canRemove, joinDisabledReason } = useEventPermissions({ user, event, members, organizers });

    // In this page there is only one event, so the current role is enough
    const getRoleByEventId = () => myRole;



    /* =========================
       Event data loading
       Fetches event details, organizers and members
    ========================= */

    const loadData = useCallback(async () => {
        try {
            setError("");
            setLoading(true);

            const [eventRes, organizersRes] = await Promise.all([
                getEventById(eventId),
                getEventOrganizers(eventId)
            ]);

            setEvent(getNormalizedEvent(eventRes));
            setOrganizers(getNormalizedOrganizers(organizersRes));

            const membersRes = await getEventMembers(eventId);
            setMembers(getNormalizedMembers(membersRes));
        } catch (error) {
            console.error("Error loading event details:", error);
            setError("❌ Failed to load event details");
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    /* =========================
       Initial data loading
       Waits for authentication state before loading
    ========================= */

    useEffect(() => {
        if (authLoading) return;
        loadData();
    }, [authLoading, loadData]);

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
       Event actions
       Membership and management operations
    ========================= */

    const { handleJoinEvent, handleLeaveEvent } = useEventActionsWithConfirm({ loadData, setMessage, setError, getRoleByEventId });

    const { handlePromote, handleDemote, handleDeleteEvent, handleRemoveMember } = useEventManagementActions({ eventId, loadData, setMessage, setError });


    /* =========================
       Loading state
    ========================= */

    if (loading) {
        return <PageLoading>Loading event details...</PageLoading>;
    }


    /* =========================
       Empty state
       Handles missing or deleted event
    ========================= */

    if (!event) {
        return (
            <div className="container page-section">
                <Card>
                    <EmptyState title="Event not found." />
                </Card>
            </div>
        );
    }


    /* =========================
       Main render
    ========================= */

    return (
        <div className="container page-section">
            <div className="page-header">
                <div>
                    <p className="page-subtitle"> View event details, manage attendance, and organize members.</p>
                </div>
            </div>

            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="danger">{error}</Alert>}

            <Card className="event-details-card">
                <div className="event-details-header">
                    <div className="event-details-header-main">
                        <h1 className="page-title">{event.title}</h1>
                        <p className="event-subtitle">{event.description || "No description provided."}</p>
                    </div>

                    <div className="event-details-header-actions">
                        {isPast ? (
                            <span className="event-status-label">Ended</span>
                        ) : user ? (
                            <>
                                {canJoin && (<Button type="button" onClick={() => handleJoinEvent(event.id)}>Join the event</Button>)}
                                {!canJoin && joinDisabledReason && (<Button type="button" disabled>{joinDisabledReason}</Button>)}

                                {canLeave && (<Button type="button" variant="outline-danger" onClick={() => handleLeaveEvent(event.id)}>Leave the event</Button>)}

                                {canEdit && (<Button type="button" variant="outline" onClick={() => navigate(`/events/${event.id}/edit`)}>Edit Event</Button>)}
                                {canDelete && (<Button type="button" variant="danger" onClick={handleDeleteEvent}>Delete Event</Button>)}
                            </>
                        ) : null}
                    </div>
                </div>

                <div className="event-info-grid">
                    <div className="event-info-card">
                        <span className="event-info-label">🏷️ Type</span>
                        <span className="event-info-value">{event.type || "N/A"}</span>
                    </div>

                    <div className="event-info-card">
                        <span className="event-info-label">🎯 Theme</span>
                        <span className="event-info-value">{event.theme || "N/A"}</span>
                    </div>

                    <div className="event-info-card">
                        <span className="event-info-label">📍 Mode</span>
                        <span className="event-info-value">{event.mode === "online" ? "Online" : "In person"}</span>
                    </div>

                    <div className="event-info-card">
                        <span className="event-info-label">📍 Location</span>
                        <span className="event-info-value">{event.mode === "online" ? "Online" : event.location || "N/A"}</span>
                    </div>

                    {event.maxParticipants && (
                        <div className="event-info-card">
                            <span className="event-info-label">👥 Capacity</span>
                            <span className="event-info-value">{event.participantCount} / {event.maxParticipants}</span>
                        </div>
                    )}

                    <div className="event-info-card">
                        <span className="event-info-label">📅 Date</span>
                        <span className="event-info-value">{formatEventDateRange(event.startDateTime, event.endDateTime)}</span>
                    </div>

                    <div className="event-info-card">
                        <span className="event-info-label">🕒 Time</span>
                        <span className="event-info-value">{formatTime(event.startDateTime)} → {formatTime(event.endDateTime)}</span>
                    </div>

                    {event.registrationDeadline && (
                        <div className="event-info-card">
                            <span className="event-info-label">⏳ Registration deadline</span>
                            <span className="event-info-value">{formatEventDateRange(event.registrationDeadline, event.registrationDeadline)}</span>
                        </div>
                    )}
                </div>
            </Card>

            <div className="details-sections">
                <Card>
                    <EventMemberList
                        title="👑 Event Team"
                        subtitle={`${formatCount(organizersCount, "member")} ${formatBe(organizersCount)} managing this event.`}
                        members={organizers}
                        emptyMessage="No team members."
                        showActions={Boolean(user)}
                        renderActions={(person) => (
                            <>
                                {canDemote(person) && (<Button type="button" variant="outline" onClick={() => handleDemote(person.id)}>Demote</Button>)}
                                {canRemove(person) && (<Button type="button" variant="danger" onClick={() => handleRemoveMember(person.id)}>Remove</Button>)}
                            </>
                        )}
                    />
                </Card>

                <Card>
                    <EventMemberList
                        title={`👥 ${participantCount} Attendee${participantCount > 1 ? "s" : ""}`}
                        subtitle={`${formatCount(participantCount, "attendee")} ${formatBe(participantCount)} attending this event.`}
                        members={participants}
                        emptyMessage={isPast ? "No one attended this event." : "No participants yet."}
                        showActions={Boolean(user)}
                        renderActions={(person) => (
                            <>
                                {canPromote(person) && (
                                    <Button type="button" variant="outline" onClick={() => handlePromote(person.id)}>Promote</Button>)}

                                {canRemove(person) && (<Button type="button" variant="danger" onClick={() => handleRemoveMember(person.id)}>Remove</Button>)}
                            </>
                        )}
                    />

                    {!user && (
                        <Alert type="info">
                            {isPast ? "This event has ended." : "🔐 Login to join this event and interact with participants."}
                        </Alert>
                    )}
                </Card>
            </div>
        </div>
    );
}