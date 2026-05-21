import Button from "../ui/Button";

/* ==================================================
   EVENT CARD ACTIONS
   Displays available actions for an event preview card

   Handles:
   - past event status
   - event full state
   - join action
   - leave action
   - registration closed state
   - login prompt
================================================== */

export default function EventCardActions({
    eventId,
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

    if (isPast) {
        return (
            <div className="event-card-actions">
                <span className="event-status-label" aria-label="Event ended">
                    Ended
                </span>
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
