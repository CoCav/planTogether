import Button from "../ui/Button";
import Badge from "../ui/Badge";

/* ==================================================
   EVENT CARD ACTIONS
   Displays available actions for an event preview card

   Handles:
   - past event status display
   - event full state
   - join action
   - leave action
   - registration closed state
   - login prompt

   Notes:
   - past event status is displayed by the event status badge
================================================== */

export default function EventCardActions({
    eventId,

    status,
    isPast,

    canLeave,

    showJoinButton,
    showEventFullButton,
    showRegistrationClosedButton,

    showLoginPrompt,

    onJoin,
    onLeave
}) {

    /* =========================
       PAST EVENT STATE
    ========================= */

    // Past events do not expose membership actions.
    // Display the event status badge instead.
    if (isPast) {
        return (
            <div className="event-card-actions">
                <Badge status={status} />
            </div>
        );
    }

    return (
        <div className="event-card-actions">

            {showEventFullButton && (
                <Button type="button" disabled>
                    Event full
                </Button>
            )}

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
                    onClick={() => onJoin?.(eventId)}
                >
                    Join the event
                </Button>
            )}

            {showRegistrationClosedButton && (
                <Button type="button" disabled>
                    Registration closed
                </Button>
            )}

            {showLoginPrompt && (
                <p className="event-login-prompt">🔐 Login to join</p>
            )}
        </div>
    );
}
