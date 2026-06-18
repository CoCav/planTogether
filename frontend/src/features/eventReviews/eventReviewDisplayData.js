import { formatReviewDate } from "../../utils/formatters";

/* ==================================================
   EVENT REVIEW DISPLAY DATA
   Builds display-ready values for event review UI

   Handles:
   - review rating display
   - review comment display
   - reviewer identity fallback
   - reviewer avatar fallback
   - formatted review dates
   - review ownership detection

   Notes:
   - used by review cards and review lists
   - ownership controls review management action visibility
================================================== */

// Builds display-ready review values
export const getEventReviewDisplayData = ({ review = {}, currentUserId = null }) => {
    const reviewer = review.user ?? {};

    return {
        id: review.id,

        rating: review.rating ?? null,
        comment: review.comment || "",

        reviewerName: reviewer.name || "Unknown user",
        reviewerAvatar: reviewer.avatar || null,

        date: formatReviewDate(review.createdAt),

        isOwner: Boolean(
            currentUserId &&
            review.userId &&
            Number(currentUserId) === Number(review.userId)
        )
    };
};
