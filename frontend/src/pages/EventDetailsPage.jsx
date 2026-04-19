import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getEventById, deleteEvent } from "../api/eventApi";
import { getEventMembers, getEventOrganizers, updateMemberRole, removeEventMember } from "../api/eventMembershipApi.js"
import { getNormalizedEvent, getNormalizedMembers, getNormalizedOrganizers } from "../utils/normalize";
import { formatEventDateRange, formatCount, formatBe, formatTime } from "../utils/format.js";
import useEventActionsWithConfirm from "../hooks/useEventActionsWithConfirm.js";

import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Alert from "../components/ui/Alert.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";

export default function EventDetailsPage() {
    const { eventId } = useParams();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Event details states: stores event date and related memberships
    const [event, setEvent] = useState(null);
    const [members, setMembers] = useState([]);
    const [organizers, setOrganizers] = useState([]); 

    // Page loading state: controls loading scren while data is fetched
    const [loading, setLoading] = useState(true);


    /* =========================
     Derived user state & Actions permissions
        Defines which actions are available depending on the current user role
    ========================= */

    // Stores current user ID
    const currentUserId = user?.userId;
    
    // Determines current ruser role in the event
    const myRole = organizers.find((person) => person.id === currentUserId)?.role || members.find((person) => person.id === currentUserId)?.role || null;
    
    // Check if current user is part of the event
    const isMember = !!myRole;

    // Can join the event
    const canJoin = user && !isMember;

    // Can leave the event
    const canLeave = user && isMember && myRole !== 'organizer';

    // Can edit the event (organizer / co_organizer)
    const canEdit = user && (myRole === 'organizer' || myRole === 'co_organizer');

    // Can delete the event (only organizer / creator)
    const canDelete = user && myRole === 'organizer';


    /* =========================
     Derived collections
        Splits visible members into organizers and participants
    ========================= */

    const participants = members.filter((person) => person.role == 'participant');
    const participantCount = event?.participantCount ?? 0;
    const organizersCount = organizers.length;


    /* =========================
     Role helper
        Returns the current role for shared event action hooks
    ========================= */
    const getRoleByEventId = () => myRole;

    /* =========================
        Data loading functions
    ========================= */

    // Fetches event details, organizer(s) and participants
    const loadData = async () => {
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
    };

    // Wait and load auth state to load before fetching event data
    useEffect(() => {
        if (authLoading) return;
        loadData();
    }, [eventId, user, authLoading]);

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
     Event membership actions
        Provides join / leave handlers with shared UX logic
    ========================= */
    const { handleJoinEvent, handleLeaveEvent } = useEventActionsWithConfirm({
        loadData,
        setMessage,
        setError,
        getRoleByEventId
    });


    /* =========================
     Permission helpers
        Determines which member management actions are allowed
    ========================= */

    const canPromote = (person) => myRole === "organizer" && person.role === "participant" && person.id !== currentUserId;
    const canDemote = (person) => myRole === "organizer" && person.role === "co_organizer" && person.id !== currentUserId;
    
    const canRemove = (person) => {
        if (person.id === currentUserId) return false;

        if (myRole === "organizer") {
            return person.role === "participant" || person.role === "co_organizer";
        }

        if (myRole === "co_organizer") {
            return person.role === "participant";
        }
        return false;
    };


    /* =========================
     Role management handlers
        Updates organizer / participant roles
    ========================= */

    const handlePromote = async (userId) => {
        try {
            setMessage("");
            setError("");

            await updateMemberRole(eventId, userId, "co_organizer");
            setMessage("✅ User promoted to co-organizer");
            await loadData();

        } catch (error) {
            console.error("Error promoting user:", error);
            setError("❌ Unable to promote user");
        }
    };

    const handleDemote = async (userId) => {
        try {
            setMessage("");
            setError("");

            await updateMemberRole(eventId, userId, "participant");
            setMessage("⬇️ User demoted to participant");
            await loadData();

        } catch (error) {
            console.error("Error demoting user:", error);
            setError("❌ Unable to demote user");
        }
    };


    /* =========================
     Event deletion handler
        Deletes the event after confirmation
    ========================= */

    const handleDeleteEvent = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this event?");
        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            await deleteEvent(eventId);
            navigate("/events");

        } catch (error) {
            console.error("Error deleting event:", error);
            setError("❌ Unable to delete event");
        }
    };
    

    /* =========================
     Member removal handler
        Removes a member from the current event after confirmation
    ========================= */
    const handleRemoveMember = async (userId) => { 
        const confirmed = window.confirm("Are you sure you want to remove this member from the event?");
        if (!confirmed) return;

        try {
            setMessage("");
            setError("");

            await removeEventMember(eventId, userId);
            setMessage("🗑️ Member removed successfully");
            await loadData();
        } catch (error) {
            console.error("Error removing member:", error);
            setError("❌ Unable to remove member");
        }
    };
    

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
                            {/* <div className="event-header-meta">
                                {event.type && (<span className="event-type-badge">🏷️ {event.type}</span>)}
                                {event.theme && (<span className="event-theme-badge">🎯 {event.theme}</span>)}
                            </div> */}
                        <p className="event-subtitle">{event.description || "No description provided."}</p>


                    </div>

                    {user && (
                        <div className="event-details-header-actions">
                            {canJoin && (<Button type="button" onClick={() => handleJoinEvent(event.id)}>Join the event</Button>)}
                            {canLeave && (<Button type="button" variant="outline-danger" onClick={() => handleLeaveEvent(event.id)}>Leave the event</Button>)}
                            {canEdit && (<Button type="button" variant="outline" onClick={() => navigate(`/events/${event.id}/edit`)}>Edit Event</Button>)}
                            {canDelete && (<Button type="button" variant="danger" onClick={handleDeleteEvent}>Delete Event</Button>)}
                        </div>
                    )}
                </div>

                <div className="event-info-grid">
                    <div className="event-info-card">
                        <span className="event-info-label">📅 Date</span>
                        <span className="event-info-value">{formatEventDateRange(event.startDateTime, event.endDateTime)}</span>
                    </div>

                    <div className="event-info-card">
                        <span className="event-info-label">🕒 Time</span>
                        <span className="event-info-value">{formatTime(event.startDateTime)} → {formatTime(event.endDateTime)}</span>
                    </div>

                    <div className="event-info-card">
                        <span className="event-info-label">📍 Location</span>
                        <span className="event-info-value">{event.mode === "online" ? "Online" : event.location || "N/A"}</span>
                    </div>

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

                    {!user && (<Alert type="info">Login to join this event and interact with participants.</Alert>)}

                    {participants.length === 0 ? (
                        <EmptyState>No participants yet.</EmptyState>
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