import { Link } from "react-router-dom";
import { CalendarDays, Clock3, Crown, Hourglass, MapPin, Users } from "lucide-react";

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
   - event title, image and description display
   - status, type, creator and membership badge display
   - event metadata display
   - completed event review summary display
   - membership action visibility
   - image fallback handling
   - public profile navigation
   - accessible event links, labels and images

   Notes:
   - completed events show review stats instead of join/leave actions
   - membership actions are delegated to EventCardActions
================================================== */

export default function EventCard({ event, user, role = null, onJoin, onLeave }) {

    /* =========================
       EVENT STATE
    ========================= */

    const {
        isPast,
        isEventFull,
        isRegistrationClosed
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

    const imageAlt = eventDisplayData.title
        ? `Event cover for ${eventDisplayData.title}`
        : "Event cover";

    const shouldShowOrganizerInline = role !== EVENT_ROLES.ORGANIZER;

    // Completed events show review stats instead of membership actions
    const shouldShowReviewSummary = isPast;

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
                                <span className="event-card-type-badge">
                                    {eventDisplayData.type}
                                </span>
                            )}

                            {shouldShowOrganizerInline && event.creatorName && (
                                event.creatorId ? (
                                    <Link to={`/users/${event.creatorId}`} className="link-hover-primary">
                                        <Badge variant="organizer" icon={Crown} label={event.creatorName} />
                                    </Link>
                                ) : (
                                    <Badge variant="organizer" icon={Crown} label={event.creatorName} />
                                )
                            )}

                            {user && role && (
                                <Badge role={role} />
                            )}
                        </div>

                    </div>

                    <div className="event-card-header-aside">
                        {shouldShowReviewSummary ? (
                            <div className="event-card-review-summary" aria-label="Event review summary">
                                {eventDisplayData.reviewLabel || "No reviews yet"}
                            </div>
                        ) : (
                            <EventCardActions
                                eventId={event.id}
                                canLeave={canLeave}
                                showJoinButton={showJoinButton}
                                onJoin={onJoin}
                                onLeave={onLeave}
                            />
                        )}
                    </div>
                </header>

                {/* =========================
                    IMAGE
                ========================= */}

                <Link
                    to={eventDetailsPath}
                    className="event-card-image-link"
                    aria-label={
                        eventDisplayData.title
                            ? `View details for ${eventDisplayData.title}`
                            : "View event details"
                    }
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
                            <Users aria-hidden="true" />

                            <span>
                                {eventDisplayData.participantLabel}
                            </span>
                        </li>

                        <li className="event-card-meta-item">
                            <CalendarDays aria-hidden="true" />

                            <span>
                                {eventDisplayData.date}
                            </span>
                        </li>

                        <li className="event-card-meta-item">
                            <Clock3 aria-hidden="true" />

                            <span>
                                {eventDisplayData.time}
                            </span>
                        </li>

                        {eventDisplayData.registrationDeadline && (
                            <li className="event-card-meta-item">
                                <Hourglass aria-hidden="true" />

                                <span>
                                    {eventDisplayData.registrationDeadline}
                                </span>
                            </li>
                        )}

                        <li className="event-card-meta-item">
                            <MapPin aria-hidden="true" />

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
