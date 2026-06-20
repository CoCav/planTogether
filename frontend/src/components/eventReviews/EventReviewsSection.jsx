import { useEffect, useState } from "react";

import useEventReviewActions from "../../features/eventReviews/hooks/useEventReviewActions";
import useEventReviewData from "../../features/eventReviews/hooks/useEventReviewData";

import EventReviewForm from "./EventReviewForm";
import EventReviewsList from "./EventReviewsList";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Card from "../ui/Card";

import LoadingState from "../ui/LoadingState";

/* ==================================================
   EVENT REVIEWS SECTION
   Displays and manages event reviews for one event

   Handles:
   - review loading
   - review form accordion state
   - review creation with rating and comment
   - review update with rating and comment
   - review deletion
   - review feedback display
   - authenticated review form toggle
   - review list rendering
   - review stats display
   - responsive review section layout

   Notes:
   - page-level section placement is handled by EventDetailsPage
   - review permissions are enforced by the backend
   - create, update and delete mutations refresh the review list after success
================================================== */

export default function EventReviewsSection({ eventId, user, setMessage, reviewLabel }) {

    /* =========================
       UI STATE
    ========================= */

    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

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
        updatingReviewId,
        deletingReviewId,

        handleCreateReview,
        handleUpdateReview,
        handleDeleteReview
    } = useEventReviewActions({
        eventId,
        loadReviews,
        setMessage,
        setError
    });

    /* =========================
       HANDLERS
    ========================= */

    const handleToggleReviewForm = () => {
        setIsReviewFormOpen((prev) => !prev);
    };

    const handleSubmitReview = async (reviewData) => {
        await handleCreateReview(reviewData);

        // Close the create-review form after a successful submission
        setIsReviewFormOpen(false);
    };

    /* =========================
       INITIAL LOADING
    ========================= */

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    return (
        <Card className="event-reviews-section-card">

            {/* =========================
               HEADER
            ========================= */}

            <div className="event-reviews-section-header">
                <div className="event-reviews-section-heading">
                    <h2 className="section-title">
                        Event reviews
                    </h2>
                </div>

                {reviewLabel && (
                    <div className="event-reviews-summary" aria-label="Event review summary">
                        {reviewLabel}
                    </div>
                )}
            </div>

            {/* =========================
               DESCRIPTION & ACTIONS
            ========================= */}

            <div className="event-reviews-section-description-row">
                <p className="section-subtitle">
                    See what participants shared after attending this event.
                </p>

                {user && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleToggleReviewForm}
                        aria-expanded={isReviewFormOpen}
                        aria-controls="event-review-form-panel"
                    >
                        {isReviewFormOpen
                            ? "Hide review form"
                            : "Write a review"}
                    </Button>
                )}
            </div>

            {/* =========================
               FEEDBACK
            ========================= */}

            {error && <Alert type="danger">{error}</Alert>}

            {/* =========================
               REVIEW FORM
            ========================= */}

            {user && isReviewFormOpen && (
                <div id="event-review-form-panel" className="event-reviews-section-form">
                    <EventReviewForm
                        onSubmit={handleSubmitReview}
                        isSubmitting={isSubmitting}
                    />
                </div>
            )}

            {/* =========================
               REVIEWS LIST
            ========================= */}

            <div className="event-reviews-section-list">
                <h3 className="event-reviews-section-subtitle">
                    Participant reviews
                </h3>

                {isLoading ? (
                    <LoadingState
                        title="Loading reviews..."
                        description="Fetching participant reviews for this event."
                    />
                ) : (
                    <EventReviewsList
                        reviews={reviews}
                        currentUserId={user?.userId}
                        updatingReviewId={updatingReviewId}
                        deletingReviewId={deletingReviewId}
                        onEdit={handleUpdateReview}
                        onDelete={handleDeleteReview}
                    />
                )}
            </div>

        </Card>
    );
}
