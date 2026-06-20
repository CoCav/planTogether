import { useState } from "react";

import { getEventReviewDisplayData } from "../../features/eventReviews/eventReviewDisplayData";

import { getAvatar } from "../../utils/uploadedFiles";

import UserAvatar from "../users/UserAvatar";

import EventReviewActions from "./EventReviewActions";
import EventReviewRating from "./EventReviewRating";
import EventReviewForm from "./EventReviewForm";

/* ==================================================
   EVENT REVIEW CARD
   Displays one event review

   Handles:
   - reviewer identity display
   - reviewer avatar display
   - review date display
   - review rating display
   - review comment display
   - review edit action visibility
   - review delete action visibility

   Notes:
   - review display data is prepared by eventReviewDisplayData
   - review actions are delegated to EventReviewActions
   - backend remains the source of truth for review ownership
================================================== */

export default function EventReviewCard({
    review,
    currentUserId = null,

    updatingReviewId = null,
    onEdit,

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

    /* =========================
       LOCAL STATE
    ========================= */

    // Controls whether this review card is currently in edit mode
    const [isEditing, setIsEditing] = useState(false);

    // Determines whether the current review is being updated
    const isUpdating = updatingReviewId === reviewDisplayData.id;

    // Determines whether the current review is being deleted
    const isDeleting = deletingReviewId === reviewDisplayData.id;

    /* =========================
       HANDLERS
    ========================= */

    // Updates the review and closes the form only if the update succeeds
    const handleEditReview = async (reviewData) => {
        const success = await onEdit?.(reviewDisplayData.id, reviewData);

        if (success !== false) {
            setIsEditing(false);
        }
    };

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
                            <div className="event-review-card-user-main">
                                <h4 className="event-review-card-name">
                                    {reviewDisplayData.reviewerName}
                                </h4>

                                <div className="event-review-card-rating">
                                    <EventReviewRating value={reviewDisplayData.rating} readOnly />
                                </div>
                            </div>

                            {reviewDisplayData.date && (
                                <p className="event-review-card-date">
                                    {reviewDisplayData.date}
                                </p>
                            )}
                        </div>
                    </div>

                    <EventReviewActions
                        canManage={reviewDisplayData.isOwner}
                        isEditing={isEditing}
                        isDeleting={isDeleting}

                        // Opens inline edit mode for this review
                        onEdit={() => setIsEditing(true)}

                        // Deletes the current review
                        onDelete={() => onDelete?.(reviewDisplayData.id)}
                    />
                </header>

                {isEditing ? (
                    <EventReviewForm
                        initialValues={{
                            rating: reviewDisplayData.rating,
                            comment: reviewDisplayData.comment
                        }}

                        submitLabel="Save changes"
                        isSubmitting={isUpdating}
                        onSubmit={handleEditReview}

                        // Leaves edit mode without saving changes
                        onCancel={() => setIsEditing(false)}
                    />
                ) : (
                    <p className="event-review-card-comment">
                        {reviewDisplayData.comment}
                    </p>
                )}
            </div>
        </article>
    );
}
