
/* ==================================================
   EVENT CARD
    Reusable component to display an event preview
    Used in both HomePage and EventsPage
================================================== */
import { Link, useNavigate } from "react-router-dom";
import { formatEventDateRange, formatTime, formatCount } from "../../utils/format";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Alert from "../ui/Alert";
import Badge from "../ui/Badge";


export default function EventCard({ event, user, role = null, onJoin, onLeave }) {

    // Role & permissions: Determines user interaction capabilities
    const isMember = Boolean(role);
    const isOrganizer = role === "organizer";

    const canJoin = Boolean(user) && !isMember;
    const canLeave = Boolean(user) && isMember && !isOrganizer;

    // Show organizer if user not logged in OR user is not the organizer
    const shouldShowOrganizerInline = !user || !isOrganizer;

    const navigate = useNavigate();

    const handleCardClick = (e) => {
        // Ignore clicks on interactive elements
        const interactive = e.target.closest("button, a");
        if (interactive) return;

        navigate(`/events/${event.id}`);
    };



    return (
        <Card className="event-car event-card-clickable" onClick={handleCardClick}>
            <div className="event-card-header">
                <div className="event-header-left">
                    <Link to={`/events/${event.id}`} className="event-title-link">
                        <h3 className="event-title">{event.title}</h3>
                    </Link>

                    <div className="event-header-meta">
                        {event.type && <span className="event-type-badge">{event.type}</span>}
                        {shouldShowOrganizerInline && event.creatorName && (<Badge variant="organizer" label={`👑 ${event.creatorName}`}></Badge>)}
                        {user && role && <Badge role={role} />}
                    </div>
                </div>

                <div className="event-header-actions">
                    {user ? ( canLeave ? (
                            <Button type="button" variant="outline-danger" onClick={() => onLeave?.(event.id)}>Leave the event</Button>
                        ) : canJoin ? (
                            <Button type="button" onClick={() => onJoin?.(event.id)}>Join the event</Button>
                        ) : null
                    ) : (
                        <Alert type="info">🔐 Login to join</Alert>
                    )}
                </div>
            </div>

            <p className="event-description">{event.description || "No description provided."}</p>

            <div className="event-meta">
                <span className="event-meta-item">👥 {formatCount(event.participantCount, "participant")}</span>
                <span className="event-meta-item">📅 {formatEventDateRange(event.startDateTime, event.endDateTime)}</span>
                <span className="event-meta-item">🕒 {formatTime(event.startDateTime)} - {formatTime(event.endDateTime)}</span>
                <span className="event-meta-item">📍 {event.mode === "online" ? "Online" : event.location || "No location"}</span>
            </div>
        </Card>
    );
}