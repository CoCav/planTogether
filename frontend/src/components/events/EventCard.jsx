import { Link } from "react-router-dom";

import { defaultEventImage, getEventImage } from "../../utils/uploadedFiles";

import useMembershipPermissions from "../../features/eventMemberships/hooks/useMembershipPermissions";

import { getEventDisplayData } from "../../features/events/eventDisplayData";

import useEventStatus from "../../features/events/hooks/useEventStatus";

import { EVENT_ROLES } from "../../features/shared/eventRoles";

import EventCardActions from "./EventCardActions";

import Badge from "../ui/Badge";

/* ==================================================
   EVENT CARD
   Displays a reusable event preview card

   Handles:
   - event preview content
   - role and type badges
   - event metadata display
   - membership action visibility
   - image fallback handling
================================================== */

export default function EventCard({ event, user, role = null, onJoin, onLeave }) {

    /* =========================
       EVENT STATE
    ========================= */

    const {
        isPast,
        isEventFull,
        isRegistrationClosed,
        showEventFullButton,
        showLoginPrompt,
        showRegistrationClosedButton
    } = useEventStatus({
        user,
        event,
        isMember: Boolean(role)
    });

    /* =========================
       MEMBERSHIP PERMISSIONS
    ========================= */

    const { canLeave, showJoinButton } = useMembershipPermissions({
        user,
        currentUserRole: role,
        isPast,
        isEventFull,
        isRegistrationClosed
    });

    /* =========================
       DISPLAY DATA
    ========================= */

    const eventDisplayData = getEventDisplayData(event);

    const eventDetailsPath = `/events/${event.id}`;

    const eventImage = getEventImage(event.image);

    const imageAlt = `Event cover for ${eventDisplayData.title}`;

    const shouldShowOrganizerInline = role !== EVENT_ROLES.ORGANIZER;

    /* =========================
       RENDER
    ========================= */

    return (
        <article className="event-card">
            <div className="card event-card-inner">

                {/* =========================
                    HEADER
                ========================= */}

                <header className="event-card-header">
                    <div className="event-card-heading">

                        <Link to={eventDetailsPath} className="event-title-link">
                            <h3 className="event-title">
                                {eventDisplayData.title}
                            </h3>
                        </Link>

                        <div className="event-card-badges" aria-label="Event labels">

                            {eventDisplayData.type && (
                                <span className="event-type-badge">{eventDisplayData.type}</span>
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
                        isPast={isPast}

                        canLeave={canLeave}
                        showJoinButton={showJoinButton}

                        showEventFullButton={showEventFullButton}
                        showRegistrationClosedButton={showRegistrationClosedButton}

                        showLoginPrompt={showLoginPrompt}
                        onJoin={onJoin}
                        onLeave={onLeave}
                    />
                </header>

                {/* =========================
                    IMAGE
                ========================= */}

                <Link
                    to={eventDetailsPath}
                    className="event-card-image-link"
                    aria-label={`View details for ${eventDisplayData.title}`}
                >
                    <img
                        src={eventImage}
                        alt={imageAlt}
                        className="event-card-image"
                        onError={(imageError) => {
                            imageError.currentTarget.src = defaultEventImage;
                        }}
                    />
                </Link>

                {/* =========================
                    CONTENT
                ========================= */}

                <div className="event-card-content">

                    <p className="event-description">
                        {eventDisplayData.description}
                    </p>

                    <ul className="event-meta-list" aria-label="Event details">

                        <li className={isEventFull ? "event-meta-item text-danger" : "event-meta-item"}>
                            <span aria-hidden="true">👥</span>

                            <span>
                                {eventDisplayData.participantLabel}
                            </span>
                        </li>

                        <li className="event-meta-item">
                            <span aria-hidden="true">📅</span>

                            <span>
                                {eventDisplayData.date}
                            </span>
                        </li>

                        <li className="event-meta-item">
                            <span aria-hidden="true">🕒</span>

                            <span>
                                {eventDisplayData.time}
                            </span>
                        </li>

                        {eventDisplayData.registrationDeadline && (
                            <li className="event-meta-item">
                                <span aria-hidden="true">⏳</span>

                                <span>
                                    {eventDisplayData.registrationDeadline}
                                </span>
                            </li>
                        )}

                        <li className="event-meta-item">
                            <span aria-hidden="true">📍</span>

                            <span>
                                {eventDisplayData.location}
                            </span>
                        </li>

                    </ul>
                </div>
            </div>
        </article>
    );
}
