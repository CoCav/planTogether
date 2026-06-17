import EventReviewCard from "./EventReviewCard";

import EmptyState from "../ui/EmptyState";

/* ==================================================
   EVENT REVIEWS LIST
   Displays event review cards

   Handles:
   - empty review state
   - review card rendering
   - current user ownership forwarding
   - delete state forwarding
   - delete action forwarding

   Notes:
   - individual review display is delegated to EventReviewCard
   - review loading state is handled by EventReviewsSection
================================================== */

export default function EventReviewsList({
    reviews = [],
    currentUserId = null,
    deletingReviewId = null,
    onDelete
}) {

    if (reviews.length === 0) {
        return (
            <EmptyState
                title="No reviews yet"
                description="Reviews will appear here once participants share their experience."
            />
        );
    }

    return (
        <div className="event-reviews-list" role="list">
            {reviews.map((review) => (
                <EventReviewCard
                    key={review.id}
                    review={review}
                    currentUserId={currentUserId}
                    deletingReviewId={deletingReviewId}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
