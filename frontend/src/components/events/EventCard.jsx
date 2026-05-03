import { Link, useNavigate } from "react-router-dom";
import { formatEventDateRange, formatTime, formatCount } from "../../utils/format";
import defaultEventImage from "../../assets/pexels-jrdb99-19683874.jpg";
import { getEventImage } from "../../utils/getUploadedFile";

import useEventPermissions from "../../hooks/events/useEventPermissions";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Alert from "../ui/Alert";
import Badge from "../ui/Badge";

/* ==================================================
   EVENT CARD
   Reusable component to display an event preview
   Used in both HomePage and EventsPage
================================================== */

export default function EventCard({ event, user, role = null, onJoin, onLeave }) {

    const navigate = useNavigate();

    /* =========================
     Membership data adapter
        Converts the current role into the members / organizers
        shape expected by useEventPermissions
    ========================= */
    const isOrganizer = role === "organizer";
    const isCoOrganizer = role === "co_organizer"
    const isParticipant = role === "participant";

    const organizers = isOrganizer || isCoOrganizer ? [{ id: user?.userId, role }] : [];
    const members = isParticipant ? [{ id: user?.userId, role }] : [];

    const shouldShowOrganizerInline = !isOrganizer;

    /* =========================
     Permissions
        Computes available actions and event state
    ========================= */

    const {
        isPast,
        isEventFull,
        canLeave,
        showEventFullButton,
        showJoinButton,
        showLoginPrompt,
        showRegistrationClosedButton
    } = useEventPermissions({ user, event, members, organizers });


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
                            {showEventFullButton && (
                                <Button type="button" disabled>Event full</Button>
                            )}

                            {canLeave && (
                                <Button type="button" variant="outline-danger" onClick={() => onLeave?.(event.id)}>Leave the event</Button>
                            )}

                            {showJoinButton && (
                                <Button type="button" onClick={() => onJoin?.(event.id)}>Join the event</Button>
                            )}

                            {showRegistrationClosedButton && (
                                <Button type="button" disabled>Registration closed</Button>
                            )}

                            {showLoginPrompt && (
                                <Alert type="info">🔐 Login to join</Alert>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="event-card-image-wrapper">
                <img
                    src={getEventImage(event.image)}
                    onError={(e) => {
                        e.currentTarget.src = defaultEventImage;
                    }}
                    alt={event.title}
                    className="event-card-image"
                />
            </div>

            <p className="event-description">{event.description || "No description provided."}</p>

            <div className="event-meta">
                {event.maxParticipants ? (
                    <span className={`event-meta-item ${isEventFull ? "text-danger" : ""}`}>👥 {event.participantCount} / {event.maxParticipants}</span>
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
