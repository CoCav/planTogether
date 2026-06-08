import { LogOut, Pencil, Trash2, UserPlus } from "lucide-react";

import Button from "../ui/Button";

/* ==================================================
   EVENT DETAILS ACTIONS
   Displays contextual actions for a single event

   Handles:
   - join action
   - leave action
   - edit action
   - delete action

   Notes:
   - event statuses and business states are displayed as badges in EventDetailsPage
================================================== */

export default function EventDetailsActions({
    eventId,

    canJoin,
    canLeave,
    canEdit,
    canDelete,

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
                    <UserPlus aria-hidden="true" />
                    Join the event
                </Button>
            )}

            {canLeave && (
                <Button
                    type="button"
                    variant="outline-danger"
                    onClick={() => onLeave(eventId)}
                >
                    <LogOut aria-hidden="true" />
                    Leave the event
                </Button>
            )}

            {canEdit && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={onEdit}
                >
                    <Pencil aria-hidden="true" />
                    Edit Event
                </Button>
            )}

            {canDelete && (
                <Button
                    type="button"
                    variant="danger"
                    onClick={onDelete}
                >
                    <Trash2 aria-hidden="true" />
                    Delete Event
                </Button>
            )}
        </div>
    );
}
