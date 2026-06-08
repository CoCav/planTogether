import { LogOut, UserPlus } from "lucide-react";

import Button from "../ui/Button";

/* ==================================================
   EVENT CARD ACTIONS
   Displays available actions for an event preview card

   Handles:
   - join action
   - leave action
   - decorative action icons

   Notes:
   - event statuses, roles and business states are displayed as badges in EventCard
================================================== */

export default function EventCardActions({
    eventId,

    canLeave,
    showJoinButton,

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
                    <LogOut aria-hidden="true" />
                    Leave the event
                </Button>
            )}

            {showJoinButton && (
                <Button
                    type="button"
                    variant="outline-primary"
                    onClick={() => onJoin?.(eventId)}
                >
                    <UserPlus aria-hidden="true" />
                    Join the event
                </Button>
            )}
        </div>
    );
}
