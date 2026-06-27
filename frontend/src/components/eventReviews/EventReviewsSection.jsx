import { useEffect, useId, useState } from "react";
import { Star } from "lucide-react";

import usePagination from "../../hooks/usePagination";
import useEventReviewActions from "../../features/eventReviews/hooks/useEventReviewActions";
import useEventReviewData from "../../features/eventReviews/hooks/useEventReviewData";

import useToast from "../../hooks/useToast";

import EventReviewForm from "./EventReviewForm";
import EventReviewsList from "./EventReviewsList";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Card from "../ui/Card";
import LoadingState from "../ui/LoadingState";
import Pagination from "../ui/Pagination";

/* ==================================================
   EVENT REVIEWS SECTION
   Displays and manages event reviews for one event

   Handles:
   - paginated review loading lifecycle
   - review form toggle state
   - accessible review form panel relationship
   - review creation, update and deletion
   - review statistics count and average rating
   - review summary display
   - inline review loading errors
   - toast feedback for review mutations
   - authenticated review form access
   - review list rendering
   - review pagination controls

   Notes:
   - section layout is controlled by EventDetailsPage
   - review permissions are enforced by backend
   - all mutations refresh review list as single source of truth
================================================== */

export default function EventReviewsSection({ eventId, user }) {

    /* =============================
       TOAST FEEDBACK
    ============================= */

    const toast = useToast();


    /* =========================
       UI STATE
    ========================= */

    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);


    /* =============================
       ACCESSIBILITY
    ============================= */

    const reviewFormPanelId = useId();


    /* =========================
       REVIEW DATA
    ========================= */

    const {
        reviews,
        pagination,

        error,

        isLoading,
        loadReviews
    } = useEventReviewData({
        eventId,
        pageSize: 4
    });

    // Review statistics are derived from review pagination metadata
    const reviewCount = pagination.totalReviews;

    // Average rating is global and comes from the review listing response
    const averageRating = pagination.averageRating !== null
        ? Number(pagination.averageRating).toFixed(1)
        : "0";


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
        toast
    });

    const {
        goToPreviousPage,
        goToNextPage
    } = usePagination({
        page: pagination.page,
        totalPages: pagination.totalPages,
        onPageChange: loadReviews
    });


    /* =========================
       HANDLERS
    ========================= */

    const handleToggleReviewForm = () => {
        setIsReviewFormOpen((prev) => !prev);
    };

    const handleSubmitReview = async (reviewData) => {
        const ok = await handleCreateReview(reviewData);

        // Close the create-review form only after a successful submission
        if (ok !== false) {
            setIsReviewFormOpen(false);
        }
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

                <div className="event-reviews-summary" aria-label="Event review summary">
                    <span className="event-reviews-summary-rating">
                        {averageRating}
                    </span>

                    <Star className="event-reviews-summary-icon" fill="var(--color-primary)" aria-hidden="true" />

                    <span className="event-reviews-summary-separator">•</span>

                    <span className="event-reviews-summary-count">
                        ({reviewCount} review{reviewCount > 1 ? "s" : ""})
                    </span>
                </div>

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
                        aria-controls={isReviewFormOpen ? reviewFormPanelId : undefined}
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
                <div id={reviewFormPanelId} className="event-reviews-section-form">
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
                    <>
                        <EventReviewsList
                            reviews={reviews}
                            currentUserId={user?.userId}
                            updatingReviewId={updatingReviewId}
                            deletingReviewId={deletingReviewId}
                            onEdit={handleUpdateReview}
                            onDelete={handleDeleteReview}
                        />

                        <Pagination
                            page={pagination.page}
                            totalPages={pagination.totalPages}
                            onPrevious={goToPreviousPage}
                            onNext={goToNextPage}
                            label="Event reviews pagination"
                        />
                    </>
                )}
            </div>

        </Card>
    );
}
