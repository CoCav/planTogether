/* ==================================================
   EVENT CARD
   Reusable component to display an event preview
   Used in both HomePage and EventsPage
================================================== */

import { Link, useNavigate } from "react-router-dom";
import { formatEventDateRange, formatTime, formatCount } from "../../utils/format";

import useEventPermissions from "../../hooks/events/useEventPermissions";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Alert from "../ui/Alert";
import Badge from "../ui/Badge";

export default function EventCard({ event, user, role = null, onJoin, onLeave }) {

    const navigate = useNavigate();

    /* =========================
     Simulated membership data
        Adapts role into structures expected
        by useEventPermissions
    ========================= */
    const organizers = role === "organizer" || role === "co_organizer" ? [{ id: user?.userId, role }] : [];
    const members = role === "participant" ? [{ id: user?.userId, role }] : [];

    /* =========================
     Permissions
    ========================= */

    const { isPast, isEventFull, canJoin, canLeave, joinDisabledReason } = useEventPermissions({ user, event, members, organizers });
    const shouldShowOrganizerInline = !user || role !== "organizer";

    const isFull = event.maxParticipants && event.participantCount >= event.maxParticipants;

    /* =========================
     Navigation
    ========================= */

    const handleCardClick = (e) => {
        const interactive = e.target.closest("button, a");
        if (interactive) return;

        navigate(`/events/${event.id}`);
    };

    return (
        <Card className="event-card event-card-clickable" onClick={handleCardClick}>
            <div className="event-card-header">

                <div className="event-header-left">
                    <Link to={`/events/${event.id}`} className="event-title-link">
                        <h3 className="event-title">{event.title}</h3>
                    </Link>

                    <div className="event-header-meta">
                        {event.type && <span className="event-type-badge">{event.type}</span>}
                        {shouldShowOrganizerInline && event.creatorName && (<Badge variant="organizer" label={`👑 ${event.creatorName}`} />)}
                        {user && role && <Badge role={role} />}
                    </div>
                </div>

                <div className="event-header-actions">
                    {isPast ? (
                        <span className="event-status-label">Ended</span>
                    ) : (
                        <>
                            {isEventFull && (<Button type="button" disabled>Event full</Button>)}
                            {user && canLeave && (<Button type="button" variant="outline-danger" onClick={() => onLeave?.(event.id)}>Leave the event</Button>)}
                            {user && !isEventFull && canJoin && (<Button type="button" onClick={() => onJoin?.(event.id)}>Join the event</Button>)}
                            {user && !isEventFull && !canJoin && joinDisabledReason && (<Button type="button" disabled>{joinDisabledReason}</Button>)}
                            {!user && !isEventFull && (<Alert type="info">🔐 Login to join</Alert>)}
                        </>
                    )}
                </div>
            </div>

            <p className="event-description">{event.description || "No description provided."}</p>

            <div className="event-meta">
                {event.maxParticipants ? (
                    <span className={`event-meta-item ${isFull ? "text-danger" : ""}`}>👥 {event.participantCount} / {event.maxParticipants}</span>
                ) : (
                    <span className="event-meta-item">👥 {formatCount(event.participantCount, "participant")}</span>
                )}
                <span className="event-meta-item">📅 {formatEventDateRange(event.startDateTime, event.endDateTime)}</span>
                <span className="event-meta-item">🕒 {formatTime(event.startDateTime)} - {formatTime(event.endDateTime)}</span>
                {event.registrationDeadline && (<span className="event-meta-item">⏳ {new Date(event.registrationDeadline).toLocaleDateString()}</span>)}
                <span className="event-meta-item">📍 {event.mode === "online" ? "Online" : event.location || "No location"}</span>
            </div>
        </Card>
    );
}