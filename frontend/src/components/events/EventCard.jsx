import { Link } from "react-router-dom";

import { defaultEventImage, getEventImage } from "../../utils/uploadedFiles";

import useMembershipPermissions from "../../features/eventMemberships/hooks/useMembershipPermissions";

import { getEventDisplayData } from "../../features/events/eventDisplayData";

import useEventStatus from "../../features/events/hooks/eventDetails/useEventStatus";

import { EVENT_ROLES } from "../../features/shared/constants/eventRoles";

import EventCardActions from "./EventCardActions";

import Badge from "../ui/Badge";

/* ==================================================
   EVENT CARD
   Displays a reusable event preview card

   Handles:
   - event preview content
   - role, type, status and state badges
   - event metadata display
   - membership action visibility
   - image fallback handling
   - public profile navigation
   - accessible image links
   - accessible event labels

   Notes:
   - event statuses and business states are displayed as badges
   - membership actions are delegated to EventCardActions
================================================== */

export default function EventCard({ event, user, role = null, onJoin, onLeave }) {

    /* =========================
       EVENT STATE
    ========================= */

    const {
        isPast,
        isEventFull,
        isRegistrationClosed,
        showLoginPrompt
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

    return (
        <article className="event-card">
            <div className="card card-interactive event-card-inner">

                {/* =========================
                    HEADER
                ========================= */}

                <header className="event-card-header">
                    <div className="event-card-heading">

                        <Link to={eventDetailsPath} className="event-card-title-link">
                            <h3 className="event-card-title">
                                {eventDisplayData.title}
                            </h3>
                        </Link>

                        <div className="event-card-badges" aria-label="Event labels">

                            <Badge status={eventDisplayData.status} />

                            {isEventFull && (
                                <Badge variant="danger" label="Event full" />
                            )}

                            {isRegistrationClosed && (
                                <Badge variant="muted" label="Registration closed" />
                            )}

                            {eventDisplayData.type && (
                                <span className="event-card-type-badge">{eventDisplayData.type}</span>
                            )}

                            {shouldShowOrganizerInline && event.creatorName && (
                                event.creatorId ? (
                                    <Link
                                        to={`/users/${event.creatorId}`}
                                        className="link-hover-primary"
                                    >
                                        <Badge variant="organizer" label={`👑 ${event.creatorName}`} />
                                    </Link>
                                ) : (
                                    <Badge variant="organizer" label={`👑 ${event.creatorName}`} />
                                )
                            )}

                            {user && role && (
                                <Badge role={role} />
                            )}

                        </div>
                    </div>

                    <EventCardActions
                        eventId={event.id}

                        canLeave={canLeave}
                        showJoinButton={showJoinButton}
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

                    <p className="event-card-description">
                        {eventDisplayData.description}
                    </p>

                    <ul className="event-card-meta-list" aria-label="Event details">

                        <li className={isEventFull ? "event-card-meta-item text-danger" : "event-card-meta-item"}>
                            <span aria-hidden="true">👥</span>

                            <span>
                                {eventDisplayData.participantLabel}
                            </span>
                        </li>

                        <li className="event-card-meta-item">
                            <span aria-hidden="true">📅</span>

                            <span>
                                {eventDisplayData.date}
                            </span>
                        </li>

                        <li className="event-card-meta-item">
                            <span aria-hidden="true">🕒</span>

                            <span>
                                {eventDisplayData.time}
                            </span>
                        </li>

                        {eventDisplayData.registrationDeadline && (
                            <li className="event-card-meta-item">
                                <span aria-hidden="true">⏳</span>

                                <span>
                                    {eventDisplayData.registrationDeadline}
                                </span>
                            </li>
                        )}

                        <li className="event-card-meta-item">
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
