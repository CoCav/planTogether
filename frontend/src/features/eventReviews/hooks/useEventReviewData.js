import { useCallback, useState } from "react";

import { getEventReviews } from "../../../api/eventReviews/eventReviewApi";

import { getApiErrorMessage } from "../../../api/apiError";

import { getNormalizedEventReviewPage } from "../eventReviewNormalizer";

/* ==================================================
   USE EVENT REVIEW DATA
   Handles event review list state, loading and pagination

   Handles:
   - public paginated review retrieval
   - review response normalization
   - review list state
   - review statistics state
   - pagination state
   - loading state
   - error state

   Notes:
   - review mutations are handled by useEventReviewActions
   - normalized reviews include rating, comment and reviewer data
   - pagination metadata and review statistics come from GET /events/:eventId/reviews
================================================== */

export default function useEventReviewData({ eventId, pageSize = 10 }) {

    /* =============================
       REVIEW STATE
    ============================= */

    const [reviews, setReviews] = useState([]);

    /* =============================
       PAGINATION STATE
    ============================= */

    const [pagination, setPagination] = useState({
        page: 1,
        pageSize,
        totalPages: 1,
        totalReviews: 0,
        averageRating: null
    });

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

    // Loads and normalizes reviews for the current event page
    const loadReviews = useCallback(async (page = 1) => {
        if (!eventId) return;

        try {
            setError("");
            setIsLoading(true);

            const response = await getEventReviews(eventId, {
                page,
                pageSize
            });

            const normalized = getNormalizedEventReviewPage(response);

            setReviews(normalized.reviews);

            setPagination((prev) => ({
                ...prev,
                page: normalized.pagination.page,
                pageSize: normalized.pagination.pageSize || prev.pageSize || pageSize,
                totalPages: normalized.pagination.totalPages,
                totalReviews: normalized.pagination.totalItems,
                averageRating: normalized.pagination.averageRating
            }));

        } catch (error) {
            setError(getApiErrorMessage(error, "Unable to load event reviews"));

        } finally {
            setIsLoading(false);
        }
    }, [
        eventId,
        pageSize
    ]);

    return {
        reviews,
        setReviews,

        pagination,
        setPagination,

        error,
        setError,

        isLoading,

        loadReviews
    };
}
