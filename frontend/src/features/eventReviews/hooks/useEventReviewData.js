import { useCallback, useState } from "react";

import { getEventReviews } from "../../../api/eventReviews/eventReviewApi";

import { getApiErrorMessage } from "../../../api/apiError";

import { getNormalizedEventReviews } from "../eventReviewNormalizer";

/* ==================================================
   USE EVENT REVIEW DATA
   Handles event review list state and loading

   Handles:
   - public review retrieval
   - review response normalization
   - review list state
   - loading state
   - error state

   Notes:
   - review mutations are handled by useEventReviewActions
   - normalized reviews include rating, comment and reviewer data
================================================== */

export default function useEventReviewData({ eventId }) {

    /* =============================
       REVIEW STATE
    ============================= */

    const [reviews, setReviews] = useState([]);

    /* =============================
       FEEDBACK STATE
    ============================= */

    const [error, setError] = useState("");

    /* =============================
       LOADING STATE
    ============================= */

    const [isLoading, setIsLoading] = useState(false);

    /* =============================
       REVIEW LOADING
    ============================= */

    // Loads and normalizes reviews for the current event
    const loadReviews = useCallback(async () => {
        if (!eventId) return;

        try {
            setError("");
            setIsLoading(true);

            const response = await getEventReviews(eventId);

            setReviews(getNormalizedEventReviews(response));

        } catch (error) {
            setError(getApiErrorMessage(
                error,
                "Unable to load event reviews"
            ));

        } finally {
            setIsLoading(false);
        }
    }, [eventId]);

    return {
        reviews,
        setReviews,

        error,
        setError,

        isLoading,

        loadReviews
    };
}
