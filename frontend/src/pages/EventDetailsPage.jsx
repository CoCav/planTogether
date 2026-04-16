import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getEventById, deleteEvent } from "../api/eventApi";
import { getEventMembers, getEventOrganizers, updateMemberRole, removeEventMember } from "../api/eventMembershipApi.js"
import { getNormalizedEvent, getNormalizedMembers, getNormalizedOrganizers } from "../utils/normalize";
import useEventActionsWithConfirm from "../hooks/useEventActionsWithConfirm.js";
import BackButton from "../components/ui/BackButton.jsx";

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
            console.error("Promote error:", error.response?.status, error.response?.data);
console.error("Remove error:", error.response?.status, error.response?.data);
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
            console.error("Promote error:", error.response?.status, error.response?.data);
console.error("Remove error:", error.response?.status, error.response?.data);
            setError("❌ Unable to demote user");
        }
    };

    const getRoleLabel = (role) => {
        if (role === "organizer") return "👑 Organizer";
        if (role === "co_organizer") return "🛡️ Co-organizer";
        if (role === "participant") return "👤 Participant";
        return null;
    };

    const getRoleStyle = (role) => {
        if (role === "organizer") return { backgroundColor: "#fef3c7" };
        if (role === "co_organizer") return { backgroundColor: "#e0f2fe" };
        return { backgroundColor: "#f3f4f6" };
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

    if (loading) return <p>Loading...</p>;
    if (!event) return <p>Event not found</p>;

    return (
        <div>

            <BackButton fallbackPath="/events" label="← Back to Events" />

            <h1>{event.title}</h1>

            {message && <p style={{ color: "green" }}>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}


            {user && (
                <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                    {!isMember ? (
                        <button onClick={() => handleJoinEvent(event.id)}>Join Event</button>
                    ) : myRole !== "organizer" ? (
                        <button onClick={() => handleLeaveEvent(event.id)}>Leave Event</button>
                    ) : null}
                    
                    {myRole === "organizer" && (
                    <div style={{ marginTop: "10px" }}>
                        <button onClick={handleDeleteEvent}>
                            Delete Event
                        </button>
        
                    </div>)} 

                    <div style={{ marginTop: "10px", marginLeft: "30px" }}>
                        {(myRole === "organizer" || myRole === "co_organizer") && (
                            <button onClick={() => navigate(`/events/${eventId}/edit`)}>
                                Edit Event
                            </button>
                        )}
                    </div>
                </div>
            )}

            

            {currentUserId && myRole && (
                <p style={{ marginTop: "10px", padding: "8px 12px", backgroundColor: "#f9fafb", borderRadius: "8px",  display: "inline-block", fontWeight: "bold", ...getRoleStyle(myRole) }}>
                    Your role in this event: {getRoleLabel(myRole)}
                </p>
            )}

            <div style={{ marginTop: "20px" }}>
                <h2>👑 {organizersCount} Organizer{organizersCount > 1 ? "s" : ""}</h2>

                {organizers.length === 0 ? (
                    <p>No organizers</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {organizers.map((person) => (
                            <li key={person.id} style={{ display: "flex",  alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #ddd"}}>

                                <div>
                                    <span style={{ fontWeight: "bold" }}>{person.name}</span>

                                    <span
                                        style={{ marginLeft: "10px", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", backgroundColor: person.role === "organizer" ? "#fef3c7" : "#e0f2fe"}}>
                                        {person.role === "organizer" ? "👑 Organizer" : "🛡️ Co-organizer"}
                                    </span>
                                </div>

                                <div> 
                                    {canDemote(person) && (<button onClick={() => handleDemote(person.id)}>Demote</button> )}

                                    {canRemove(person) && (<button onClick={() => handleRemoveMember(person.id)} style={{ marginLeft: "10px" }}> Remove </button>)}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Theme:</strong> {event.theme}</p>
            <p><strong>Type:</strong> {event.type}</p>

            {!user && <p>Login to view participants.</p>}


            {user && (
                <div style={{ marginTop: "20px" }}>
                    <h2>👥 {participantCount} Attendee{participantCount > 1 ? "s" : ""}</h2>

                    {participants.length === 0 ? (
                        <p>No participants</p>
                    ) : (
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {participants.map((person) => (
                                <li key={person.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #ddd" }}>

                                    <div>
                                        <span style={{ fontWeight: "bold" }}>{person.name}</span>

                                        <span style={{ marginLeft: "10px", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", backgroundColor: "#f3f4f6" }}>👤 Participant</span>
                                    </div>

                                    <div>
                                        {canPromote(person) && (<button onClick={() => handlePromote(person.id)}>Promote</button>)}

                                        {canRemove(person) && (<button onClick={() => handleRemoveMember(person.id)} style={{ marginLeft: "10px" }}> Remove </button>)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}               
        </div>
    );
}