import EventLikeButton from "./EventLikeButton";

import useEventLike from "../../features/eventLikes/hooks/useEventLike";

/* ==================================================
   EVENT LIKE TOGGLE
   Connects event like state to the like button

   Handles:
   - event like hook wiring
   - initial liked state
   - initial likes count
   - mutation disabled state
   - parent like state updates
   - guest like prompt handling

   Notes:
   - EventLikeButton stays presentational
   - toast feedback is handled by useEventLike
================================================== */

export default function EventLikeToggle({
    eventId,
    user,
    liked = false,
    likesCount = 0,
    toast,
    onLikeChange
}) {

    /* =========================
       LIKE STATE
    ======================== */

    const {
        likeState,
        likeActions
    } = useEventLike({
        eventId,
        initialLiked: liked,
        initialLikesCount: likesCount,
        toast,
        onLikeChange
    });

    /* =========================
       DISPLAY
    ========================= */

    // Guests are prompted to log
    if (!user) {
        return (
            <EventLikeButton
                liked={false}
                likesCount={likesCount}
                onToggle={() => toast?.info?.("Login to like events.")}
            />
        );
    }

    // Authenticated users can toggle likes
    return (
        <EventLikeButton
            liked={likeState.liked}
            likesCount={likeState.likesCount}
            disabled={likeState.isTogglingLike}
            onToggle={likeActions.handleToggleLike}
        />
    );
}
