import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Shapes, Sparkles } from "lucide-react";

import { useAuth } from "../features/auth/hooks/useAuth";

import { getEventDisplayData } from "../features/events/eventDisplayData";

import useEventActions from "../features/events/hooks/eventDetails/useEventActions";
import useEventDetailsData from "../features/events/hooks/eventDetails/useEventDetailsData";
import useEventDetailsState from "../features/events/hooks/eventDetails/useEventDetailsState";
import useEventStatus from "../features/events/hooks/eventDetails/useEventStatus";

import { getEventMembershipState } from "../features/eventMemberships/eventMembershipState";

import useMembershipActions from "../features/eventMemberships/hooks/useMembershipActions";
import useMembershipManagement from "../features/eventMemberships/hooks/useMembershipManagement";
import useMembershipPermissions from "../features/eventMemberships/hooks/useMembershipPermissions";

import { isOnlineEventMode } from "../features/shared/constants/eventModes";

import { defaultEventImage, getEventImage } from "../utils/uploadedFiles";

import EventDetailsActions from "../components/events/EventDetailsActions";
import EventDetailsSummary from "../components/events/EventDetailsSummary";
import EventLocationMap from "../components/events/EventLocationMap";

import EventParticipantsSection from "../components/eventMemberships/EventParticipantsSection";
import EventStaffSection from "../components/eventMemberships/EventStaffSection";

import EventReviewsSection from "../components/eventReviews/EventReviewsSection";

import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import PageLoader from "../components/ui/PageLoader";

/* ==================================================
   EVENT DETAILS PAGE
   Displays and manages a single event details view

   Handles:
   - event details and membership data loading
   - event availability and registration state
   - membership permissions and restrictions
   - join, leave, edit, and delete actions
   - ownership transfer and member management
   - event status and availability badges
   - display-ready event formatting
   - accessible event image rendering
   - physical event location map display
   - staff and participant section management
   - event review section placement for completed events
================================================== */

export default function EventDetailsPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const { user, loading: authLoading } = useAuth();


    /* =============================
       PAGE STATE
    ============================= */

    const {
        feedback: {
            message,
            setMessage,
            error,
            setError
        },
        loadingState: {
            loading,
            setLoading
        }
    } = useEventDetailsState();


    /* =============================
       PAGE DATA
    ============================= */

    const { event, members, staff, loadData } = useEventDetailsData({
        eventId,
        setError,
        setLoading
    });


    /* =============================
       MEMBERSHIP STATE
    ============================= */

    const {
        participants,
        participantCount,
        staffCount,
        currentUserRole,
        isMember
    } = getEventMembershipState({
        user,
        event,
        members,
        staff
    });


    /* =============================
       EVENT STATUS
    ============================= */

    // Resolves event availability and time-based restrictions
    const {
        isPast,
        isStarted,

        isEventFull,
        isRegistrationClosed,
    } = useEventStatus({
        user,
        event,
        isMember
    });


    /* =============================
       MEMBERSHIP PERMISSIONS
    ============================= */

    const {
        myRole,

        canJoin,
        canLeave,

        canEdit,
        canDelete,

        canTransferOwnership,
        canPromote,
        canDemote,
        canRemove
    } = useMembershipPermissions({
        user,
        currentUserRole,

        members,
        staff,

        isPast,
        isStarted,

        isEventFull,
        isRegistrationClosed
    });


    /* =============================
       EVENT ACTIONS
    ============================= */

    const { handleDeleteEvent } = useEventActions({
        eventId,
        setMessage,
        setError
    });


    /* =============================
       MEMBERSHIP ACTIONS
    ============================= */

    const { handleJoinEvent, handleLeaveEvent } = useMembershipActions({
        loadData,
        setMessage,
        setError,
        currentUserRole: myRole
    });

    const {
        handleTransferOwnership,
        handlePromoteMember,
        handleDemoteMember,
        handleRemoveMember
    } = useMembershipManagement({
        eventId,
        loadData,
        setMessage,
        setError
    });


    /* =============================
       INITIAL DATA LOADING
    ============================= */

    // Waits for auth initialization before loading page data
    useEffect(() => {
        if (authLoading) return;

        loadData();
    }, [authLoading, loadData]);


    /* =============================
       FEEDBACK CLEANUP
    ============================= */

    // Auto-clears feedback messages after delay
    useEffect(() => {
        if (!message && !error) return;

        const timer = setTimeout(() => {
            setMessage("");
            setError("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [message, error, setMessage, setError]);


    /* =============================
       LOADING / EMPTY STATES
    ============================= */

    if (loading) {
        return (
            <PageLoader
                title="Loading event details..."
                description="Please wait while we load this event."
            />
        );
    }

    if (!event) {
        return (
            <div className="container page-section">
                <Card>
                    <EmptyState title="Event not found." />
                </Card>
            </div>
        );
    }


    /* =============================
       DISPLAY DATA
    ============================= */

    const eventDisplayData = getEventDisplayData(event);

    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <main className="container page-section">
            <header className="page-header">
                <div className="page-header-content">
                    <h1 id="event-details-page-title" className="page-title">
                        Event details
                    </h1>

                    <p className="page-subtitle">
                        View event details, manage attendance,
                        and organize members.
                    </p>
                </div>
            </header>

            {/* =============================
               GLOBAL EVENT STATE
            ============================= */}

            {!user && (
                <Alert type="info">
                    Login to join events and manage your participation.
                </Alert>
            )}

            {/* =============================
               FEEDBACK MESSAGES
            ============================= */}

            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="danger">{error}</Alert>}

            <section className="event-details-overview" aria-labelledby="event-details-title">
                <Card className="event-details-card">
                    <div className="event-details-header">
                        <div className="event-details-heading">
                            <h2 id="event-details-title" className="event-details-title">
                                {eventDisplayData.title}
                            </h2>

                            <div className="event-details-badges">
                                <Badge status={eventDisplayData.status} />

                                {isEventFull && (
                                    <Badge variant="danger" label="Event full" />
                                )}

                                {isRegistrationClosed && (
                                    <Badge variant="muted" label="Registration closed" />
                                )}
                            </div>
                        </div>

                        <div className="event-details-actions">
                            <EventDetailsActions
                                eventId={event.id}
                                canJoin={canJoin}
                                canLeave={canLeave}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                onJoin={handleJoinEvent}
                                onLeave={handleLeaveEvent}
                                onEdit={() => navigate(`/events/${event.id}/edit`)}
                                onDelete={handleDeleteEvent}
                            />
                        </div>
                    </div>

                    <div className="event-details-image-wrapper">
                        <img
                            src={getEventImage(event.image)}
                            alt={`Event cover for ${eventDisplayData.title}`}
                            className="event-details-image"
                            onError={(imageError) => {
                                imageError.currentTarget.src = defaultEventImage;
                            }}
                        />
                    </div>

                    <div className="event-details-content">
                        <div className="event-details-about">
                            <div className="event-details-heading-group">
                                <h3 className="event-details-section-title">
                                    About this event
                                </h3>

                                <div className="event-details-category-list" aria-label="Event categories">
                                    <span className="event-details-category-tag">
                                        <span className="event-details-category-label">Type: </span>
                                        <Shapes aria-hidden="true" />
                                        {eventDisplayData.type}
                                    </span>

                                    <span className="event-details-category-tag">
                                        <span className="event-details-category-label">Theme: </span>
                                        <Sparkles aria-hidden="true" />
                                        {eventDisplayData.theme}
                                    </span>
                                </div>
                            </div>

                            <p className="event-details-description">
                                {eventDisplayData.description}
                            </p>
                        </div>

                        <EventDetailsSummary
                            mode={eventDisplayData.mode}
                            location={isOnlineEventMode(event.mode) ? null : eventDisplayData.location}
                            capacity={eventDisplayData.capacity}
                            date={eventDisplayData.date}
                            time={eventDisplayData.time}
                            registrationDeadline={eventDisplayData.registrationDeadline}
                        />

                        {!isOnlineEventMode(event.mode) && eventDisplayData.location && (
                            <section className="event-location-section">
                                <div className="event-location-heading">
                                    <h3 className="event-details-section-title">
                                        Event location
                                    </h3>

                                    <p className="event-location-description">
                                        View this event on the map.
                                    </p>
                                </div>

                                <EventLocationMap
                                    eventTitle={eventDisplayData.title}
                                    location={eventDisplayData.location}
                                    selectedLocation={eventDisplayData.selectedLocation}
                                    isPublic={!user}
                                />
                            </section>
                        )}
                    </div>
                </Card>
            </section>

            <section className="event-details-members" aria-label="Event members">
                <EventStaffSection
                    user={user}

                    staff={staff}
                    staffCount={staffCount}

                    canTransferOwnership={canTransferOwnership}
                    canDemote={canDemote}
                    canRemove={canRemove}

                    onTransferOwnership={handleTransferOwnership}
                    onDemote={handleDemoteMember}
                    onRemove={handleRemoveMember}
                />

                <EventParticipantsSection
                    user={user}
                    isPast={isPast}

                    participants={participants}
                    participantCount={participantCount}

                    canTransferOwnership={canTransferOwnership}
                    canPromote={canPromote}
                    canRemove={canRemove}

                    onTransferOwnership={handleTransferOwnership}
                    onPromote={handlePromoteMember}
                    onRemove={handleRemoveMember}
                />
            </section>

            {isPast && (
                <section className="event-details-reviews" aria-labelledby="event-reviews-title">
                    <EventReviewsSection
                        eventId={event.id}
                        user={user}
                        setMessage={setMessage}
                        reviewLabel={eventDisplayData.reviewLabel}
                    />
                </section>
            )}
        </main>
    );
}
