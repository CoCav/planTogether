import { useState } from "react";

import { getApiErrorMessage } from "../../../api/apiError";
import { likeEvent, unlikeEvent } from "../../../api/eventLikes/eventLikesApi";

import { normalizeEventLike } from "../eventLikeNormalizer";

/* ==================================================
   USE EVENT LIKE HOOK
   Handles event like mutations and local like state

   Actions:
   - like event
   - unlike event
   - toggle event like state

   UI states:
   - liked
   - likesCount
   - isTogglingLike

   Notes:
   - backend prevents duplicate likes
   - unlike is idempotent
   - parent components can receive updated like state through onLikeChange
   - uses toast feedback for temporary action messages
================================================== */

export default function useEventLike({
    eventId,
    initialLiked = false,
    initialLikesCount = 0,
    toast,
    onLikeChange
}) {

    /* =============================
       LIKE STATE
    ============================= */

    const [liked, setLiked] = useState(Boolean(initialLiked));
    const [likesCount, setLikesCount] = useState(Number(initialLikesCount ?? 0));
    const [isTogglingLike, setIsTogglingLike] = useState(false);

    /* =============================
       STATE UPDATE
    ============================= */

    // Applies backend like payload to local state
    const applyLikeResult = (payload) => {
        const normalizedLike = normalizeEventLike(payload);

        setLiked(normalizedLike.liked);
        setLikesCount(normalizedLike.likesCount);

        onLikeChange?.(normalizedLike);

        return normalizedLike;
    };

    /* =============================
       TOGGLE LIKE
    ============================= */

    // Toggles the current user's like for one event
    const handleToggleLike = async () => {
        if (!eventId || isTogglingLike) return null;

        try {
            setIsTogglingLike(true);

            const response = liked
                ? await unlikeEvent(eventId)
                : await likeEvent(eventId);

            const normalizedLike = applyLikeResult(response);

            toast?.success(
                normalizedLike.liked
                    ? "Event liked."
                    : "Event unliked."
            );

            return normalizedLike;

        } catch (error) {
            toast?.danger(getApiErrorMessage(error, "Unable to update event like"));

            return null;

        } finally {
            setIsTogglingLike(false);
        }
    };

    return {
        likeState: {
            liked,
            likesCount,
            isTogglingLike
        },

        likeActions: {
            handleToggleLike,
            setLiked,
            setLikesCount
        }
    };
}
