import { Heart } from "lucide-react";

import Button from "../ui/Button";

/* ==================================================
   EVENT LIKE BUTTON
   Displays event like state and count

   Handles:
   - liked and unliked button display
   - like count display
   - guest like prompt button display
   - disabled mutation state
   - accessible pressed state and label
   - decorative heart icon

   Notes:
   - API mutations are handled by useEventLike
   - parent components provide the current like state
   - guest users can be prompted to log in without calling the API
================================================== */

export default function EventLikeButton({
    liked = false,
    likesCount = 0,
    disabled = false,
    interactive = true,
    onToggle
}) {

    /* =========================
       DISPLAY STATE
    ========================= */

    // Resolves the current button appearance
    const likeEventClassName = liked
        ? "event-like-control event-like-control-active"
        : "event-like-control";

    // Guests see a non-persistent like control
    if (!interactive) {
        return (
            <span
                className="event-like-control event-like-display"
                aria-label={`${likesCount} likes`}
                title="Login to like this event"
            >
                <Heart aria-hidden="true" />
                <span>{likesCount}</span>
            </span>
        );
    }

    return (
        <Button
            type="button"
            variant={liked ? "primary" : "outline-primary"}
            className={likeEventClassName}
            onClick={onToggle}
            disabled={disabled}
            aria-pressed={liked}
            aria-label={liked ? `Unlike event. ${likesCount} likes` : `Like event. ${likesCount} likes`}
        >
            <Heart aria-hidden="true" fill={liked ? "currentColor" : "none"} />
            <span>{likesCount}</span>
        </Button>
    );
}
