import Alert from "../ui/Alert";
import Button from "../ui/Button";

/* ==================================================
   EVENT DETAILS ACTIONS
   Displays contextual actions for a single event

   Handles:
   - join action
   - leave action
   - edit action
   - delete action
   - guest login prompt

   Notes:
   - event statuses and business states are displayed as badges in EventDetailsPage
================================================== */

export default function EventDetailsActions({
    eventId,

    canJoin,
    canLeave,
    canEdit,
    canDelete,

    showLoginPrompt,

    onJoin,
    onLeave,
    onEdit,
    onDelete
}) {
    return (
        <div className="event-details-actions">

            {canJoin && (
                <Button
                    type="button"
                    variant="outline-primary"
                    onClick={() => onJoin(eventId)}
                >
                    Join the event
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
                <Alert type="info">Login to join this event.</Alert>
            )}
        </div>
    );
}
