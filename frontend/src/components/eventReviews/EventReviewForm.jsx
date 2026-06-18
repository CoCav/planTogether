import useEventReviewForm from "../../features/eventReviews/hooks/forms/useEventReviewForm";

import EventReviewRating from "./EventReviewRating";

import Button from "../ui/Button";
import FormField from "../ui/FormField";

/* ==================================================
   EVENT REVIEW FORM
   Displays the event review creation form

   Handles:
   - review rating selection
   - review comment input
   - validation error display
   - submit action
   - submit loading state
   - accessible form field association

   Notes:
   - form state and validation are handled by useEventReviewForm
   - backend enforces review permissions
================================================== */

export default function EventReviewForm({ onSubmit, isSubmitting = false }) {

    /* =========================
       FORM STATE
    ========================= */

    const { formState, formActions } = useEventReviewForm({
        onSubmitValid: onSubmit
    });

    const { values, fieldErrors } = formState;

    const { handleFieldChange, handleRatingChange, handleSubmit } = formActions;

    return (
        <form className="event-review-form" onSubmit={handleSubmit}>

            {/* =========================
               RATING FIELD
            ========================= */}

            <FormField label="Rating" htmlFor="review-rating" error={fieldErrors.rating}>
                {(errorId) => (
                    <div
                        id="review-rating"
                        aria-describedby={errorId}
                        aria-invalid={Boolean(fieldErrors.rating)}
                    >
                        <EventReviewRating
                            value={values.rating}
                            onChange={handleRatingChange}
                            disabled={isSubmitting}
                        />
                    </div>
                )}
            </FormField>

            {/* =========================
                COMMENT FIELD
            ========================= */}

            <FormField label="Comment" htmlFor="review-comment" error={fieldErrors.comment}>
                {(errorId) => (
                    <textarea
                        id="review-comment"
                        name="comment"
                        value={values.comment}
                        onChange={handleFieldChange}
                        rows="3"
                        className="textarea textarea-resize-vertical event-review-form-textarea"
                        placeholder="What did you think of this event?"
                        aria-describedby={errorId}
                        aria-invalid={Boolean(fieldErrors.comment)}
                        disabled={isSubmitting}
                    />
                )}
            </FormField>

            {/* =========================
                ACTIONS
            ========================= */}

            <div className="event-review-form-actions">
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Submit review"}
                </Button>
            </div>
        </form>
    );
}
