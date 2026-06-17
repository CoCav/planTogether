import { getEventReviewDisplayData } from "../../features/eventReviews/eventReviewDisplayData";

import { getAvatar } from "../../utils/uploadedFiles";

import UserAvatar from "../users/UserAvatar";

import EventReviewActions from "./EventReviewActions";

/* ==================================================
   EVENT REVIEW CARD
   Displays one event review

   Handles:
   - reviewer identity display
   - reviewer avatar display
   - review date display
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

    const isDeleting = deletingReviewId === reviewDisplayData.id;

    return (
        <article className="event-review-card">
            <div className="event-review-card-inner">
                <header className="event-review-card-header">
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
                        </div>
                    </div>

                    <EventReviewActions
                        reviewId={reviewDisplayData.id}
                        canDelete={reviewDisplayData.isOwner}
                        isDeleting={isDeleting}
                        onDelete={onDelete}
                    />
                </header>

                <p className="event-review-card-comment">
                    {reviewDisplayData.comment}
                </p>

            </div>
        </article>
    );
}
