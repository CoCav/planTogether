import { useState } from "react";

import { getApiErrorMessage } from "../../../api/apiError";

import { createEventReview, deleteEventReview, updateEventReview } from "../../../api/eventReviews/eventReviewApi";

/* ==================================================
   USE EVENT REVIEW ACTIONS HOOK
   Handles event review mutations and UI states

   Actions:
   - create review (rating + comment)
   - update own review
   - delete own review with confirmation
   - refresh review list after success

   UI states:
   - isSubmitting (create)
   - updatingReviewId (edit per review)
   - deletingReviewId (delete per review)

   Notes:
   - backend enforces permissions (ownership + event rules)
   - loadReviews is the source of truth refresh mechanism
   - window.confirm is used for delete confirmation
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
    const [updatingReviewId, setUpdatingReviewId] = useState(null);
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

            return true;

        } catch (error) {
            setError(getApiErrorMessage(error, "Unable to create review"));

            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    /* =============================
       UPDATE REVIEW
    ============================= */

    // Updates the current user's review and refreshes the review list
    const handleUpdateReview = async (reviewId, { rating, comment }) => {
        try {
            setMessage("");
            setError("");
            setUpdatingReviewId(reviewId);

            await updateEventReview(reviewId, {
                rating,
                comment
            });

            setMessage("Review updated successfully");

            await loadReviews();

            return true;

        } catch (error) {
            setError(getApiErrorMessage(error, "Unable to update review"));

            return false;
        } finally {
            setUpdatingReviewId(null);
        }
    };

    /* =============================
       DELETE REVIEW
    ============================= */

    // Deletes the current user's review after confirmation
    const handleDeleteReview = async (reviewId) => {
        const confirmed = window.confirm("Are you sure you want to delete this review?");

        if (!confirmed) return false;

        try {
            setMessage("");
            setError("");
            setDeletingReviewId(reviewId);

            await deleteEventReview(reviewId);

            setMessage("Review deleted successfully");

            await loadReviews();

            return true;

        } catch (error) {
            setError(getApiErrorMessage(error, "Unable to delete review"));
            return false;

        } finally {
            setDeletingReviewId(null);
        }
    };

    return {
        isSubmitting,
        updatingReviewId,
        deletingReviewId,

        handleCreateReview,
        handleUpdateReview,
        handleDeleteReview
    };
}
