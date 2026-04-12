import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEventById, getEventMembers, getEventOrganizers, updateMemberRole } from "../api/eventApi";
import { getNormalizedEvent, getNormalizedMembers, getNormalizedOrganizers } from "../utils/normalize";
import { useAuth } from "../context/useAuth";

export default function EventDetailsPage() {
    const { eventId } = useParams();
    const { user, loading: authLoading } = useAuth();

    const [event, setEvent] = useState(null);
    const [members, setMembers] = useState([]);
    const [organizers, setOrganizers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    // Find current user's role in this event
    const myRole = organizers.find((userRole) => userRole.id === user?.id)?.role || members.find((userRole) => userRole.id === user?.id)?.role || null;


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

    if (loading) return <p>Loading...</p>;
    if (!event) return <p>Event not found</p>;

    return (
        <div>
            <h1>{event.title}</h1>

            {message && <p style={{ color: "green" }}>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={{ marginTop: "20px" }}>
                <h2>Organized by</h2>

                {organizers.length === 0 ? (
                    <p>No organizers</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {organizers.map((person) => (
                            <li key={person.id} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #ddd"}}>

                                <span style={{ fontWeight: "bold" }}>{person.name}</span>

                                <span style={{ marginLeft: "10px", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", backgroundColor: person.role === "organizer" ? "#fef3c7" : "#e0f2fe"}}>
                                    {person.role === "organizer" ? "👑 Organizer" : "🛡️ Co-organizer"}
                                </span>
                                
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
                    <h2>Participants</h2>

                    {members.length === 0 ? (
                        <p>No participants</p>
                    ) : (
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {members.map((person) => (
                                <li key={person.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #ddd" }}>
                                    {person.name} ({person.role})

                                    <div>
                                        <span style={{ fontWeight: "bold" }}>{person.name}</span>

                                        <span style={{ marginLeft: "10px", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", backgroundColor: person.role === "co_organizer" ? "#e0f2fe" : "#f3f4f6"}}>
                                            {person.role === "co_organizer" ? "🛡️ Co-organizer" : "👤 Participant"}
                                        </span>
                                    </div>

                                    {myRole === "organizer" && person.id !== user.id && (
                                    <div>
                                        {person.role === "participant" && (
                                            <button
                                                onClick={() => handlePromote(person.id)}
                                                style={{ marginLeft: "10px" }}>
                                                Promote
                                            </button>
                                        )}

                                            {person.role === "co_organizer" && (
                                                <button
                                                    onClick={() => handleDemote(person.id)}
                                                    style={{ marginLeft: "10px" }}>
                                                    Demote
                                                </button>
                                            )}
                                    </div>)}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}               
        </div>
    );
}