import { useState } from "react";

import { getApiErrorMessage } from "../../../api/apiError";

import { createEventReview, deleteEventReview } from "../../../api/eventReviews/eventReviewApi";

/* ==================================================
   EVENT REVIEW ACTIONS HOOK
   Handles event review mutations for the current user

   Actions:
   - create a review with rating and comment
   - delete the current user's own review
   - refresh reviews after successful mutations
   - expose submit and delete loading states

   Notes:
   - backend enforces completed-event and participant-only review rules
   - backend enforces review ownership on deletion
================================================== */

export default function useEventReviewActions({
    eventId,
    loadReviews,
    setMessage,
    setError
}) {

    /* =============================
       ACTION STATES
    ============================= */

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingReviewId, setDeletingReviewId] = useState(null);

    /* =============================
       CREATE REVIEW
    ============================= */

    // Creates a review and refreshes the review list
    const handleCreateReview = async ({ rating, comment }) => {
        try {
            setMessage("");
            setError("");
            setIsSubmitting(true);

            await createEventReview(eventId, {
                rating,
                comment
            });

            setMessage("Review added successfully");

            await loadReviews();

        } catch (error) {
            setError(getApiErrorMessage(error, "Unable to create review"));

        } finally {
            setIsSubmitting(false);
        }
    };

    /* =============================
       DELETE REVIEW
    ============================= */

    // Deletes the current user's review after confirmation
    const handleDeleteReview = async (reviewId) => {
        const confirmed = window.confirm("Are you sure you want to delete this review?");

        if (!confirmed) return;

        try {
            setMessage("");
            setError("");
            setDeletingReviewId(reviewId);

            await deleteEventReview(reviewId);

            setMessage("Review deleted successfully");

            await loadReviews();

        } catch (error) {
            setError(getApiErrorMessage(error, "Unable to delete review"));

        } finally {
            setDeletingReviewId(null);
        }
    };

    return {
        isSubmitting,
        deletingReviewId,

        handleCreateReview,
        handleDeleteReview
    };
}
