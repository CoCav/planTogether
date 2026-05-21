import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../features/auth/hooks/useAuth";

import { getEventDisplayData } from "../features/events/eventDisplayData";

import useEventActions from "../features/events/hooks/useEventActions";
import useEventDetailsData from "../features/events/hooks/useEventDetailsData";
import useEventDetailsState from "../features/events/hooks/useEventDetailsState";
import useEventStatus from "../features/events/hooks/useEventStatus";

import { getEventMembershipState } from "../features/eventMemberships/eventMembershipState";

import useMembershipActions from "../features/eventMemberships/hooks/useMembershipActions";
import useMembershipManagement from "../features/eventMemberships/hooks/useMembershipManagement";
import useMembershipPermissions from "../features/eventMemberships/hooks/useMembershipPermissions";

import { defaultEventImage, getEventImage } from "../utils/uploadedFiles";

import EventDetailsActions from "../components/events/EventDetailsActions";
import EventDetailsSummary from "../components/events/EventDetailsSummary";
import EventParticipantsSection from "../components/events/EventParticipantsSection";
import EventStaffSection from "../components/events/EventStaffSection";

import Alert from "../components/ui/Alert";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import PageLoader from "../components/ui/PageLoader";

/* ==================================================
   EVENT DETAILS PAGE
   Displays and manages a single event details view

   Handles:
   - event details, members, and staff loading
   - event availability state
   - membership permissions
   - join / leave event actions
   - event deletion
   - staff and participant management
   - display-ready event data
   - accessible event image description
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
        canPromote,
        canDemote,
        canRemove
    } = useMembershipPermissions({
        user,
        currentUserRole,
        members,
        staff,
        isPast,
        isEventFull,
        isRegistrationClosed
    });

    // Adapts current role lookup for membership action hooks
    const getRoleByEventId = () => myRole;


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
        getRoleByEventId
    });

    const { handlePromoteMember, handleDemoteMember, handleRemoveMember } = useMembershipManagement({
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
            <PageLoader>
                Loading event details...
            </PageLoader>
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
                <div>
                    <h1 className="page-title">
                        Event details
                    </h1>

                    <p className="page-subtitle">
                        View event details, manage attendance,
                        and organize members.
                    </p>
                </div>
            </header>

            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="danger">{error}</Alert>}

            <section className="event-details-overview" aria-labelledby="event-details-title">
                <Card className="event-details-card">
                    <div className="event-details-header">
                        <h2 id="event-details-title" className="event-details-title">
                            {eventDisplayData.title}
                        </h2>

                        <EventDetailsActions
                            eventId={event.id}
                            isPast={isPast}
                            canJoin={canJoin}
                            canLeave={canLeave}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            showEventFullButton={showEventFullButton}
                            showRegistrationClosedButton={showRegistrationClosedButton}
                            showLoginPrompt={showLoginPrompt}
                            onJoin={handleJoinEvent}
                            onLeave={handleLeaveEvent}
                            onEdit={() => navigate(`/events/${event.id}/edit`)}
                            onDelete={handleDeleteEvent}
                        />
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

                    <p className="event-details-description">{eventDisplayData.description}</p>

                    <EventDetailsSummary
                        type={eventDisplayData.type}
                        theme={eventDisplayData.theme}
                        mode={eventDisplayData.mode}
                        location={eventDisplayData.location}
                        capacity={eventDisplayData.capacity}
                        date={eventDisplayData.date}
                        time={eventDisplayData.time}
                        registrationDeadline={eventDisplayData.registrationDeadline}
                    />
                </Card>
            </section>

            <section className="event-details-members">
                <EventStaffSection
                    user={user}
                    staff={staff}
                    staffCount={staffCount}
                    canDemote={canDemote}
                    canRemove={canRemove}
                    onDemote={handleDemoteMember}
                    onRemove={handleRemoveMember}
                />

                <EventParticipantsSection
                    user={user}
                    isPast={isPast}
                    participants={participants}
                    participantCount={participantCount}
                    canPromote={canPromote}
                    canRemove={canRemove}
                    onPromote={handlePromoteMember}
                    onRemove={handleRemoveMember}
                />
            </section>
        </main>
    );
}
