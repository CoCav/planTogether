import { useState } from "react";

import { getEventReviewDisplayData } from "../../features/eventReviews/eventReviewDisplayData";

import { getAvatar } from "../../utils/uploadedFiles";

import UserAvatar from "../users/UserAvatar";

import EventReviewActionsMenu from "./EventReviewActionsMenu";
import EventReviewRating from "./EventReviewRating";
import EventReviewForm from "./EventReviewForm";

/* ==================================================
   EVENT REVIEW CARD
   Displays one event review

   Handles:
   - reviewer identity display
   - reviewer avatar display
   - review date display
   - read-only review rating display
   - review comment display
   - accessible review list item semantics
   - review edit mode with inline form
   - review update and delete actions for owners
   - loading states for updating and deleting

   Notes:
   - review display data is prepared by eventReviewDisplayData
   - review actions are delegated to EventReviewActionsMenu
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

    const data = getEventReviewDisplayData({ review, currentUserId });

    /* =========================
       LOCAL STATE
    ========================= */

    // Controls whether this review card is currently in edit mode
    const [isEditing, setIsEditing] = useState(false);

    // Determines whether the current review is being updated
    const isUpdating = updatingReviewId === data.id;

    // Determines whether the current review is being deleted
    const isDeleting = deletingReviewId === data.id;

    /* =========================
       HANDLERS
    ========================= */

    // Updates the review and closes the form only if the update succeeds
    const handleEdit = async (payload) => {
        const ok = await onEdit?.(data.id, payload);
        if (ok !== false) setIsEditing(false);
    };

    return (
        <article className="event-review-card" role="listitem">
            <div className="event-review-card-inner">

                <div className="event-review-card-top">
                    <div className="event-review-card-left">

                        <UserAvatar
                            src={getAvatar(data.reviewerAvatar)}
                            name={data.reviewerName}
                            className="user-avatar-sm"
                        />

                        <div className="event-review-card-content">
                            <div className="event-review-card-name-row">
                                <h4 className="event-review-card-name">
                                    {data.reviewerName}
                                </h4>

                                <div className="event-review-card-rating">
                                    <EventReviewRating
                                        value={data.rating}
                                        readOnly
                                    />
                                </div>
                            </div>

                        </div>

                    </div>

                    {data.isOwner && !isEditing && (
                        <div className="event-review-card-actions">
                            <EventReviewActionsMenu
                                canManage={data.isOwner}
                                isEditing={isEditing}
                                isDeleting={isDeleting}
                                onEdit={() => setIsEditing(true)}
                                onDelete={() => onDelete?.(data.id)}
                            />
                        </div>
                    )}

                </div>

                {data.date && (
                    <p className="event-review-card-date">
                        {data.date}
                    </p>
                )}

                {isEditing ? (
                    <EventReviewForm
                        initialValues={{
                            rating: data.rating,
                            comment: data.comment
                        }}
                        submitLabel="Save changes"
                        isSubmitting={isUpdating}
                        onSubmit={handleEdit}
                        onCancel={() => setIsEditing(false)}
                    />
                ) : (
                    <p className="event-review-card-comment">
                        {data.comment}
                    </p>
                )}

            </div>
        </article>
    );
}
