import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEventById, getEventMembers, getEventOrganizers } from "../api/eventApi";
import { getNormalizedEvent, getNormalizedMembers, getNormalizedOrganizers } from "../utils/normalize";
import { useAuth } from "../context/useAuth";

export default function EventDetailsPage() {
    const { eventId } = useParams();
    const { user, loading: authLoading } = useAuth();

    const [event, setEvent] = useState(null);
    const [members, setMembers] = useState([]);
    const [organizers, setOrganizers] = useState([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {

    // Wait for auth state to load before fetching event details
    if (authLoading) return;

    const fetchData = async () => {
        try {
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
        } finally {
            setLoading(false);
        }
    };

    fetchData();}, [eventId, user]);

    if (loading) return <p>Loading...</p>;
    if (!event) return <p>Event not found</p>;

    return (
        <div>
            <h1>{event.title}</h1>

            <div style={{ marginTop: "20px" }}>
                        <h2>Organized by</h2>

                        {organizers.length === 0 ? (
                             <p>No organizers</p>
                        ) : (
                            <ul>
                                {organizers.map((user) => (
                                    <li key={user.id}>
                                        {user.name}
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

                <>
                    <div style={{ marginTop: "20px" }}>
                        <h2>Participants</h2>

                        {members.length === 0 ? (
                            <p>No participants</p>
                        ) : (
                            <ul>
                                {members.map((user) => (
                                    <li key={user.id}>
                                        {user.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}               
        </div>
    );
}