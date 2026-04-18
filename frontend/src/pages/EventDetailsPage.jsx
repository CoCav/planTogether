import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getEventById, deleteEvent } from "../api/eventApi";
import { getEventMembers, getEventOrganizers, updateMemberRole, removeEventMember } from "../api/eventMembershipApi.js"
import { getNormalizedEvent, getNormalizedMembers, getNormalizedOrganizers } from "../utils/normalize";
import { formatDate } from "../utils/format.js";
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

    const [event, setEvent] = useState(null);
    const [members, setMembers] = useState([]);
    const [organizers, setOrganizers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Determine current user's role in the event
    const currentUserId = user?.userId;
    const myRole = organizers.find((person) => person.id === currentUserId)?.role || members.find((person) => person.id === currentUserId)?.role || null;
    const isMember = !!myRole;

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

            if (user) {

                const membersRes = await getEventMembers(eventId);
                setMembers(getNormalizedMembers(membersRes));

            } else {
                setMembers([]);
            }

        } catch (error) {
            console.error("Error loading event details:", error);
            setError("❌ Failed to load event details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Wait for auth state to load before fetching event details
        if (authLoading) return;
        loadData();
    }, [eventId, user, authLoading]);

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

    const participants = members.filter((person) => person.role == 'participant');
    const participantCount = participants.length;
    const organizersCount = organizers.length;

    const getRoleByEventId = () => myRole;

    const { handleJoinEvent, handleLeaveEvent } = useEventActionsWithConfirm({
        loadData,
        setMessage,
        setError,
        getRoleByEventId
    });

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
    
    // Removes a member from the current event
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
            console.error("Remove error status:", error.response?.status);
            console.error("Remove error data:", error.response?.data);
            setError("❌ Unable to remove member");
        }
    };

    if (loading) {
        return (
            <div className="container page-section">
                <LoadingState>Loading event details...</LoadingState>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="container page-section">
                <Card>
                    <EmptyState>Event not found.</EmptyState>
                </Card>
            </div>
        );
    }

    return (
        <div className="container page-section">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{event.title}</h1>
                    <p className="page-subtitle">View event details, manage attendance, and organize members.</p>
                </div>
            </div>

            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="danger">{error}</Alert>}

            <Card className="event-details-card">
                <div className="event-details-header">
                    <div className="event-details-main">
                        <h2 className="section-title">Event Overview</h2>
                        <p className="event-description">{event.description || "No description provided."}</p>
                    </div>

                    {currentUserId && myRole && (
                        <div className="role-summary">
                            <span className="role-summary-label">Your role</span>
                            <Badge role={myRole} />
                        </div>
                    )}
                </div>

                {user && (
                    <div className="action-bar">
                        {!isMember ? (
                            <Button type="button" onClick={() => handleJoinEvent(event.id)}>Join Event</Button>
                        ) : myRole !== "organizer" ? (
                            <Button type="button" variant="outline" onClick={() => handleLeaveEvent(event.id)}>Leave Event</Button>
                        ) : null}

                        {(myRole === "organizer" || myRole === "co_organizer") && (
                            <Button type="button" variant="outline" onClick={() => navigate(`/events/${eventId}/edit`)}>Edit Event</Button>
                        )}

                        {myRole === "organizer" && (
                            <Button type="button" variant="danger" onClick={handleDeleteEvent}>Delete Event</Button>
                        )}
                    </div>
                )}

                <div className="details-grid">
                    <div className="detail-item">
                        <span className="detail-label">Date</span>
                        <span className="detail-value">{formatDate(event.date)}</span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Location</span>
                        <span className="detail-value">{event.location || "N/A"}</span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Theme</span>
                        <span className="detail-value">{event.theme || "N/A"}</span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">Type</span>
                        <span className="detail-value">{event.type || "N/A"}</span>
                    </div>
                </div>
            </Card>

            <div className="details-sections">
                <Card>
                    <div className="section-header">
                        <h2 className="section-title">👑 {organizersCount} Organizer{organizersCount > 1 ? "s" : ""}</h2>
                        <p className="section-subtitle">Event leadership and co-organization team.</p>
                    </div>

                    {organizers.length === 0 ? (
                        <EmptyState>No organizers.</EmptyState>
                    ) : (
                        <div className="member-list">
                            {organizers.map((person) => (
                                <div key={person.id} className="member-row">
                                    <div className="member-info">
                                        <span className="member-name">{person.name}</span>
                                        <Badge role={person.role} />
                                    </div>

                                    <div className="member-actions">
                                        {canDemote(person) && (
                                            <Button type="button" variant="outline" onClick={() => handleDemote(person.id)}>Demote</Button>
                                        )}

                                        {canRemove(person) && (
                                            <Button type="button" variant="danger" onClick={() => handleRemoveMember(person.id)}>Remove</Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {!user ? (
                    <Card>
                        <EmptyState>Login to view participants.</EmptyState>
                    </Card>
                    ) : (
                    <Card>
                        <div className="section-header">
                            <h2 className="section-title">👥 {participantCount} Attendee{participantCount > 1 ? "s" : ""}</h2>
                            <p className="section-subtitle">Members currently participating in this event.</p>
                        </div>

                        {participants.length === 0 ? (
                            <EmptyState>No participants.</EmptyState>
                        ) : (
                            <div className="member-list">
                                {participants.map((person) => (
                                    <div key={person.id} className="member-row">
                                        <div className="member-info">
                                            <span className="member-name">{person.name}</span>
                                            <Badge role={person.role} />
                                        </div>

                                        <div className="member-actions">
                                            {canPromote(person) && (
                                                <Button type="button" variant="outline" onClick={() => handlePromote(person.id)}>Promote</Button>
                                            )}

                                            {canRemove(person) && (
                                                <Button type="button" variant="danger" onClick={() => handleRemoveMember(person.id)}>Remove</Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
}