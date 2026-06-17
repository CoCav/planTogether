import { useCallback, useState } from "react";

import { getEventReviews } from "../../../api/eventReviews/eventReviewApi";

import { getApiErrorMessage } from "../../../api/apiError";

import { getNormalizedEventReviews } from "../eventReviewNormalizer";

/* ==================================================
   USE EVENT REVIEW DATA
   Handles event review list loading

   Handles:
   - event review loading
   - review response normalization
   - loading state
   - error state

   Notes:
   - review retrieval is public
   - mutations are handled by dedicated review hooks
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
