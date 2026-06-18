import { useEffect } from "react";

import useEventReviewActions from "../../features/eventReviews/hooks/useEventReviewActions";
import useEventReviewData from "../../features/eventReviews/hooks/useEventReviewData";

import EventReviewForm from "./EventReviewForm";
import EventReviewsList from "./EventReviewsList";

import Alert from "../ui/Alert";
import Card from "../ui/Card";

/* ==================================================
   EVENT REVIEWS SECTION
   Displays and manages event reviews for one event

   Handles:
   - review loading
   - review creation with rating and comment
   - review deletion
   - review feedback display
   - authenticated review form visibility
   - review list rendering

   Notes:
   - page-level section placement is handled by EventDetailsPage
   - review permissions are enforced by the backend
   - create and delete mutations refresh the review list after success
================================================== */

export default function EventReviewsSection({ eventId, user, setMessage }) {

    /* =========================
       REVIEW DATA
    ========================= */

    const {
        reviews,

        error,
        setError,

        isLoading,
        loadReviews
    } = useEventReviewData({ eventId });

    /* =========================
       REVIEW ACTIONS
    ========================= */

    const {
        isSubmitting,
        deletingReviewId,

        handleCreateReview,
        handleDeleteReview
    } = useEventReviewActions({
        eventId,
        loadReviews,
        setMessage,
        setError
    });

    /* =========================
       INITIAL LOADING
    ========================= */

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    return (
        <Card className="event-reviews-section-card">
            <div className="section-header">
                <h2 id="event-reviews-title" className="section-title">
                    Event reviews
                </h2>

                <p className="section-subtitle">
                    See what participants shared after attending this event.
                </p>
            </div>

            {error && <Alert type="danger">{error}</Alert>}

            {user && (
                <div className="event-reviews-section-block event-reviews-section-form">
                    <h3 className="event-reviews-section-subtitle">
                        Share your experience
                    </h3>

                    <EventReviewForm
                        onSubmit={handleCreateReview}
                        isSubmitting={isSubmitting}
                    />
                </div>
            )}

            <div className="event-reviews-section-block">
                <h3 className="event-reviews-section-subtitle">
                    Participant reviews
                </h3>

                {isLoading ? (
                    <p className="status-text">Loading reviews...</p>
                ) : (
                    <EventReviewsList
                        reviews={reviews}
                        currentUserId={user?.userId}
                        deletingReviewId={deletingReviewId}
                        onDelete={handleDeleteReview}
                    />
                )}
            </div>
        </Card>
    );
}
