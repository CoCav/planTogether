import Alert from "../ui/Alert";
import Button from "../ui/Button";

/* ==================================================
   EVENT DETAILS ACTIONS
   Displays contextual actions for a single event

   Handles:
   - past event status display
   - join / leave actions
   - edit / delete actions
   - availability disabled states
   - guest login prompt
   - accessible ended status
   - accessible guest prompt
================================================== */

export default function EventDetailsActions({
    eventId,

    isPast,

    canJoin,
    canLeave,
    canEdit,
    canDelete,

    showEventFullButton,
    showRegistrationClosedButton,
    showLoginPrompt,

    onJoin,
    onLeave,
    onEdit,
    onDelete
}) {
    // Past events do not expose interactive event actions
    if (isPast) {
        return (
            <div className="event-details-actions">
                <span className="event-status-label" aria-label="Event ended">
                    Ended
                </span>
            </div>
        );
    }

    return (
        <div className="event-details-actions">
            {showEventFullButton && (
                <Button type="button" disabled>
                    Event full
                </Button>
            )}

            {canJoin && (
                <Button type="button" onClick={() => onJoin(eventId)}>
                    Join the event
                </Button>
            )}

            {showRegistrationClosedButton && (
                <Button type="button" disabled>
                    Registration closed
                </Button>
            )}

            {canLeave && (
                <Button type="button" variant="outline-danger" onClick={() => onLeave(eventId)} >
                    Leave the event
                </Button>
            )}

            {canEdit && (
                <Button type="button" variant="outline" onClick={onEdit}  >
                    Edit Event
                </Button>
            )}

            {canDelete && (
                <Button type="button" variant="danger" onClick={onDelete}>
                    Delete Event
                </Button>
            )}

            {showLoginPrompt && (
                <Alert type="info">🔐 Login to join this event.</Alert>
            )}
        </div>
    );
}
