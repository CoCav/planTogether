import { getEventReviewDisplayData } from "../../features/eventReviews/eventReviewDisplayData";

import { getAvatar } from "../../utils/uploadedFiles";

import UserAvatar from "../users/UserAvatar";

import EventReviewActions from "./EventReviewActions";
import EventReviewRating from "./EventReviewRating";

/* ==================================================
   EVENT REVIEW CARD
   Displays one event review

   Handles:
   - reviewer identity display
   - reviewer avatar display
   - review date display
   - review rating display
   - review comment display
   - review action visibility

   Notes:
   - review display data is prepared by eventReviewDisplayData
   - review actions are delegated to EventReviewActions
   - backend remains the source of truth for delete authorization
================================================== */

export default function EventReviewCard({
    review,
    currentUserId = null,
    deletingReviewId = null,
    onDelete
}) {

    /* =========================
       DISPLAY DATA
    ========================= */

    const reviewDisplayData = getEventReviewDisplayData({
        review,
        currentUserId
    });

    // Determines whether the current review is being deleted
    const isDeleting = deletingReviewId === reviewDisplayData.id;

    return (
        <article className="event-review-card">
            <div className="event-review-card-inner">
                <header className="event-review-card-header">

                    {/* Reviewer information */}
                    <div className="event-review-card-user">
                        <UserAvatar
                            src={getAvatar(reviewDisplayData.reviewerAvatar)}
                            name={reviewDisplayData.reviewerName}
                            className="user-avatar-sm"
                        />

                        <div className="event-review-card-user-info">
                            <h4 className="event-review-card-name">
                                {reviewDisplayData.reviewerName}
                            </h4>

                            {reviewDisplayData.date && (
                                <p className="event-review-card-date">
                                    {reviewDisplayData.date}
                                </p>
                            )}

                            {/* Review rating */}
                            <div className="event-review-card-rating">
                                <EventReviewRating value={reviewDisplayData.rating} readOnly />
                            </div>
                        </div>
                    </div>

                    {/* Owner-only review actions */}
                    <EventReviewActions
                        reviewId={reviewDisplayData.id}
                        canDelete={reviewDisplayData.isOwner}
                        isDeleting={isDeleting}
                        onDelete={onDelete}
                    />
                </header>

                {/* Review content */}
                <p className="event-review-card-comment">
                    {reviewDisplayData.comment}
                </p>

            </div>
        </article>
    );
}
