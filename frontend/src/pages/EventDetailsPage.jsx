import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getEventById } from "../api/eventApi";
import { getEventMembers, getEventOrganizers } from "../api/eventMembershipApi.js";
import { getNormalizedEvent, getNormalizedMembers, getNormalizedOrganizers } from "../features/events/normalizeData.js";
import { formatEventDateRange, formatCount, formatBe, formatTime } from "../utils/format.js";
import useEventManagementActions from "../hooks/events/useEventManagementActions";
import useEventActionsWithConfirm from "../hooks/events/useEventActionsWithConfirm";
import useEventPermissions from "../hooks/events/useEventPermissions";

import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Alert from "../components/ui/Alert.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";

/* ==================================================
   EVENT DETAILS PAGE
   Displays detailed information about a specific event,
   including participants and organizers.

   Allows users to:
   - Join or leave the event
   - Edit or delete the event if authorized
   - Manage members by promoting, demoting, or removing them

   Uses centralized permission logic via useEventPermissions
   to control UI actions based on user role and event state.
================================================== */

export default function EventDetailsPage() {
    const { eventId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Event details states: stores event data and related memberships
    const [event, setEvent] = useState(null);
    const [members, setMembers] = useState([]);
    const [organizers, setOrganizers] = useState([]);

    // Page loading state: controls loading screen while data is fetched
    const [loading, setLoading] = useState(true);


    /* =========================
     Derived collections
        Splits visible members into organizers and participants
    ========================= */

    const participants = members.filter((person) => person.role === "participant");
    const participantCount = event?.participantCount ?? participants.length;
    const organizersCount = organizers.length;


    /* =========================
     Event permissions
        Centralizes action visibility and role-based permissions
    ========================= */

    const { myRole, isPast, canJoin, canLeave, canEdit, canDelete, canPromote, canDemote, canRemove, joinDisabledReason } = useEventPermissions({ user, event, members, organizers });

    // Returns the current role for shared event action hooks
    const getRoleByEventId = () => myRole;


    /* =========================
        Data loading functions
    ========================= */

    // Fetches event details, organizer(s), and participants
    const loadData = async () => {
        try {
            setError("");
            setLoading(true);

            const [eventRes, organizersRes] = await Promise.all([
                getEventById(eventId),
                getEventOrganizers(eventId),
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
    };

    // Waits for auth state before fetching event data
    useEffect(() => {
        if (authLoading) return;
        loadData();
    }, [eventId, user, authLoading]);

    // Auto-clears feedback messages after delay
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
    ========================= */

    // Membership actions (join / leave with confirmation)
    const { handleJoinEvent, handleLeaveEvent } = useEventActionsWithConfirm({ loadData, setMessage, setError, getRoleByEventId });

    // Management actions (promote, demote, remove, delete)
    const { handlePromote, handleDemote, handleDeleteEvent, handleRemoveMember } = useEventManagementActions({ eventId, loadData, setMessage, setError });


    /* =========================
        Loading render
    ========================= */

    if (loading) {
        return (
            <div className="container page-section">
                <LoadingState>Loading event details...</LoadingState>
            </div>
        );
    }

    /* =========================
     Empty render
        Handles missing or deleted event state
    ========================= */

    if (!event) {
        return (
            <div className="container page-section">
                <Card>
                    <EmptyState>Event not found.</EmptyState>
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
                    <p className="page-subtitle">View event details, manage attendance, and organize members.</p>
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
                            <span className="event-info-value">
                                {event.participantCount} / {event.maxParticipants}
                            </span>
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
                            <span className="event-info-value">
                                {formatEventDateRange(event.registrationDeadline, event.registrationDeadline)}
                            </span>
                        </div>
                    )}
                </div>
            </Card>

            <div className="details-sections">
                <Card>
                    <div className="section-header">
                        <h2 className="section-title">👑 Event Team</h2>
                        <p className="section-subtitle">{formatCount(organizersCount, "member")} {formatBe(organizersCount)} managing this event.</p>
                    </div>

                    {organizers.length === 0 ? (
                        <EmptyState>No team members.</EmptyState>
                    ) : (
                        <div className="member-list">
                            {organizers.map((person) => (
                                <div key={person.id} className="member-row">
                                    <div className="member-info">
                                        <span className="member-name">{person.name}</span>
                                        <Badge role={person.role} />
                                    </div>

                                    {user && (
                                        <div className="member-actions">
                                            {canDemote(person) && (<Button type="button" variant="outline" onClick={() => handleDemote(person.id)}>Demote</Button>)}
                                            {canRemove(person) && (<Button type="button" variant="danger" onClick={() => handleRemoveMember(person.id)}>Remove</Button>)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card>
                    <div className="section-header">
                        <h2 className="section-title">👥 {participantCount} Attendee{participantCount > 1 ? "s" : ""}</h2>
                        <p className="section-subtitle">{formatCount(participantCount, "attendee")} {formatBe(participantCount)} attending this event.</p>
                    </div>

                    {!user && (
                        <Alert type="info">
                            {isPast ? "This event has ended." : "🔐 Login to join this event and interact with participants."}
                        </Alert>
                    )}

                    {participants.length === 0 ? (
                        <EmptyState>
                            {isPast ? "No one attended this event." : "No participants yet."}
                        </EmptyState>
                    ) : (
                        <div className="member-list">
                            {participants.map((person) => (
                                <div key={person.id} className="member-row">
                                    <div className="member-info">
                                        <span className="member-name">{person.name}</span>
                                        <Badge role={person.role} />
                                    </div>

                                    {user && (
                                        <div className="member-actions">
                                            {canPromote(person) && (<Button type="button" variant="outline" onClick={() => handlePromote(person.id)}>Promote</Button>)}
                                            {canRemove(person) && (<Button type="button" variant="danger" onClick={() => handleRemoveMember(person.id)}>Remove</Button>)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}