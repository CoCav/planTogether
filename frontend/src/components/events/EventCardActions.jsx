import Button from "../ui/Button";

/* ==================================================
   EVENT CARD ACTIONS
   Displays available actions for an event preview card

   Handles:
   - join action
   - leave action
   - login prompt

   Notes:
   - event statuses, roles and business states are displayed as badges in EventCard
================================================== */

export default function EventCardActions({
    eventId,

    canLeave,
    showJoinButton,
    showLoginPrompt,

    onJoin,
    onLeave
}) {
    return (
        <div className="event-card-actions">

            {canLeave && (
                <Button
                    type="button"
                    variant="outline-danger"
                    onClick={() => onLeave?.(eventId)}
                >
                    Leave the event
                </Button>
            )}

            {showJoinButton && (
                <Button
                    type="button"
                    variant="outline-primary"
                    onClick={() => onJoin?.(eventId)}
                >
                    Join the event
                </Button>
            )}

            {showLoginPrompt && (
                <p className="event-login-prompt">Login to join</p>
            )}
        </div>
    );
}
