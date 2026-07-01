import { LogOut, Pencil, Trash2, UserPlus } from "lucide-react";

import EventLikeToggle from "../eventLikes/EventLikeToggle";

import Button from "../ui/Button";

/* ==================================================
   EVENT DETAILS ACTIONS
   Displays contextual actions for a single event

   Handles:
   - join action visibility and callback
   - leave action visibility and callback
   - edit action visibility and callback
   - delete action visibility and callback
   - event like toggle display
   - safe optional action handlers
   - decorative action icons

   Notes:
   - event statuses and business states are displayed as badges in EventDetailsPage
   - event like interactions are delegated to EventLikeToggle
================================================== */

export default function EventDetailsActions({
    eventId,

    user,

    canJoin,
    canLeave,
    canEdit,
    canDelete,

    liked,
    likesCount,
    toast,
    onLikeChange,

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
                    onClick={() => onJoin?.(eventId)}
                >
                    <UserPlus aria-hidden="true" />
                    Join the event
                </Button>
            )}

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

            {canEdit && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onEdit?.()}
                >
                    <Pencil aria-hidden="true" />
                    Edit Event
                </Button>
            )}

            {canDelete && (
                <Button
                    type="button"
                    variant="danger"
                    onClick={() => onDelete?.()}
                >
                    <Trash2 aria-hidden="true" />
                    Delete Event
                </Button>
            )}

            <EventLikeToggle
                eventId={eventId}
                user={user}
                liked={liked}
                likesCount={likesCount}
                toast={toast}
                onLikeChange={onLikeChange}
            />
        </div>
    );
}
