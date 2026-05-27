import Alert from "../ui/Alert";
import Badge from "../ui/Badge";
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

   Notes:
   - past events do not expose interactive actions
   - the status badge replaces action buttons for past events
================================================== */

export default function EventDetailsActions({
    eventId,

    status,
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

    /* =========================
       PAST EVENT STATE
    ========================= */

    // Past events do not expose interactive actions.
    // Display the event status badge instead.
    if (isPast) {
        return (
            <div className="event-details-actions">
                <Badge status={status} />
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
                <Button
                    type="button"
                    variant="outline-danger"
                    onClick={() => onLeave(eventId)}
                >
                    Leave the event
                </Button>
            )}

            {canEdit && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={onEdit}
                >
                    Edit Event
                </Button>
            )}

            {canDelete && (
                <Button
                    type="button"
                    variant="danger"
                    onClick={onDelete}
                >
                    Delete Event
                </Button>
            )}

            {showLoginPrompt && (
                <Alert type="info">🔐 Login to join this event.</Alert>
            )}
        </div>
    );
}
