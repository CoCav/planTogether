import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEventById, getEventMembers, getEventOrganizers } from "../api/eventApi";
import { normalizeEvent, normalizeUserRoleData } from "../utils/normalize";

export default function EventDetailsPage() {
    const { eventId } = useParams();

    const [event, setEvent] = useState(null);
    const [members, setMembers] = useState([]);
    const [organizers, setOrganizers] = useState([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {

    const fetchData = async () => {
        try {
            const [eventRes, membersRes, organizersRes] = await Promise.all([
            getEventById(eventId),
            getEventMembers(eventId),
            getEventOrganizers(eventId)]);


            setEvent(normalizeEvent(eventRes.data.event));
            setMembers(normalizeUserRoleData(membersRes.data.members));
            setOrganizers(normalizeUserRoleData(organizersRes.data.organizers));
            
        } catch (error) {
            console.error("Error loading event details:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();}, [eventId]);

    if (loading) return <p>Loading...</p>;
    if (!event) return <p>Event not found</p>;

    return (
        <div>
            <h1>{event.title}</h1>
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Theme:</strong> {event.theme}</p>
            <p><strong>Type:</strong> {event.type}</p>

            {/* 👑 ORGANIZERS */}
            <div style={{ marginTop: "20px" }}>
                <h2>Organizers</h2>

                {organizers.length === 0 ? (
                    <p>No organizers</p>
                ) : (
                    <ul>
                        {organizers.map((user) => (
                        <li key={user.id}>{user.name}</li>))}
                    </ul>
                )}
            </div>

            {/* 👥 MEMBERS */}
            <div style={{ marginTop: "20px" }}>
                <h2>Participants</h2>

                {members.length === 0 ? (
                    <p>No participants</p>
                ) : (
                    <ul>
                        {members.map((user) => (
                        <li key={user.id}>{user.name}</li>))}
                    </ul>
                 )}
            </div>
        </div>
    );
}