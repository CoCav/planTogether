import { useState } from "react";

import { getApiErrorMessage } from "../../../api/apiError";

import { createEventReview, deleteEventReview, updateEventReview } from "../../../api/eventReviews/eventReviewApi";

/* ==================================================
   USE EVENT REVIEW ACTIONS HOOK
   Handles event review mutations and UI states

   Actions:
   - create review
   - update own review
   - delete own review with confirmation
   - refresh review list after success

   UI states:
   - isSubmitting
   - updatingReviewId
   - deletingReviewId

   Notes:
   - backend enforces permissions
   - loadReviews is the source of truth refresh mechanism
   - uses toast feedback for temporary action messages
   - window.confirm is kept for delete confirmation
================================================== */

export default function useEventReviewActions({
    eventId,
    loadReviews,
    toast
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
            setIsSubmitting(true);

            await createEventReview(eventId, {
                rating,
                comment
            });

            toast.success("Review posted.");

            await loadReviews();

            return true;

        } catch (error) {
            toast.danger(getApiErrorMessage(error, "Unable to create review"));

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
            setUpdatingReviewId(reviewId);

            await updateEventReview(reviewId, {
                rating,
                comment
            });

            toast.success("Review updated.");

            await loadReviews();

            return true;

        } catch (error) {
            toast.danger(getApiErrorMessage(error, "Unable to update review"));

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
            setDeletingReviewId(reviewId);

            await deleteEventReview(reviewId);

            toast.success("Review deleted.");

            await loadReviews();

            return true;

        } catch (error) {
            toast.danger(getApiErrorMessage(error, "Unable to delete review"));
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
