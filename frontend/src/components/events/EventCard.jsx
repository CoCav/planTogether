import { Link } from "react-router-dom";

import { formatCount, formatEventDateRange, formatTime } from "../../utils/formatters";
import { defaultEventImage, getEventImage } from "../../utils/uploadedFiles";

import useMembershipPermissions from "../../features/eventMemberships/hooks/useMembershipPermissions";

import Badge from "../ui/Badge";

import EventCardActions from "./EventCardActions";

/* ==================================================
   EVENT CARD
   Displays a reusable event preview card

   Handles:
   - event summary display
   - role and type badges
   - event metadata
   - event availability state
================================================== */

export default function EventCard({ event, user, role = null, onJoin, onLeave }) {

    /* =========================
        Event state
    ========================= */

    const isPast = event.status === "past";

    const isEventFull =
        event.maxParticipants !== null &&
        event.participantCount >= event.maxParticipants;

    const isRegistrationClosed =
        event.registrationDeadline
            ? new Date(event.registrationDeadline) < new Date()
            : false;

    /* =========================
        Membership permissions
    ========================= */

    const { canLeave, showJoinButton } = useMembershipPermissions({
        user,
        currentUserRole: role,
        isPast,
        isEventFull,
        isRegistrationClosed
    });

    /* =========================
        Derived display state
    ========================= */

    const eventDetailsPath = `/events/${event.id}`;

    const eventImage = getEventImage(event.image);

    const imageAlt = `Event cover for ${event.title}`;

    const shouldShowOrganizerInline = role !== "organizer";

    const participantLabel = event.maxParticipants
        ? `${event.participantCount} / ${event.maxParticipants}`
        : formatCount(event.participantCount, "participant");

    return (
        <article className="event-card">
            <div className="card event-card-inner">

                {/* =========================
                    HEADER
                ========================= */}

                <header className="event-card-header">
                    <div className="event-card-heading">
                        <Link to={eventDetailsPath} className="event-title-link">
                            <h3 className="event-title"> {event.title} </h3>
                        </Link>

                        <div className="event-card-badges" aria-label="Event labels" >

                            {event.type && (
                                <span className="event-type-badge">{event.type}</span>
                            )}

                            {shouldShowOrganizerInline && event.creatorName && (
                                <Badge variant="organizer" label={`👑 ${event.creatorName}`} />
                            )}

                            {user && role && (
                                <Badge role={role} />
                            )}

                        </div>

                    </div>

                    <EventCardActions
                        eventId={event.id}
                        user={user}
                        isPast={isPast}
                        isEventFull={isEventFull}
                        isRegistrationClosed={isRegistrationClosed}
                        canLeave={canLeave}
                        showJoinButton={showJoinButton}
                        onJoin={onJoin}
                        onLeave={onLeave}
                    />

                </header>

                {/* =========================
                    IMAGE
                ========================= */}

                <Link to={eventDetailsPath} className="event-card-image-link" aria-label={`View details for ${event.title}`}>
                    <img
                        src={eventImage}
                        alt={imageAlt}
                        className="event-card-image"
                        onError={(event) => {
                            event.currentTarget.src = defaultEventImage;
                        }}
                    />
                </Link>

                {/* =========================
                    CONTENT
                ========================= */}

                <div className="event-card-content">
                    <p className="event-description">
                        {event.description || "No description provided."}
                    </p>

                    <ul className="event-meta-list" aria-label="Event details" >

                        <li className={
                            isEventFull
                                ? "event-meta-item text-danger"
                                : "event-meta-item"
                        }>
                            <span aria-hidden="true">👥</span>{" "}

                            <span>{participantLabel}</span>
                        </li>

                        <li className="event-meta-item">
                            <span aria-hidden="true">📅</span>{" "}
                            <span>
                                {formatEventDateRange(event.startDateTime, event.endDateTime)}
                            </span>
                        </li>

                        <li className="event-meta-item">
                            <span aria-hidden="true">🕒</span>{" "}
                            <span>
                                {formatTime(event.startDateTime)}
                                {" - "}
                                {formatTime(event.endDateTime)}
                            </span>
                        </li>

                        {event.registrationDeadline && (
                            <li className="event-meta-item">
                                <span aria-hidden="true">⏳</span>{" "}
                                <span>
                                    {new Date(event.registrationDeadline).toLocaleDateString()}
                                </span>
                            </li>
                        )}

                        <li className="event-meta-item">
                            <span aria-hidden="true">📍</span>{" "}
                            <span>
                                {event.mode === "online" ? "Online" : event.location || "No location"}
                            </span>
                        </li>

                    </ul>
                </div>
            </div>
        </article>
    );
}
