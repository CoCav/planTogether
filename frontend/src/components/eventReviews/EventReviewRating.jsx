import { Star } from "lucide-react";

/* ==================================================
   EVENT REVIEW RATING
   Displays or selects an event review rating

   Handles:
   - read-only rating display
   - interactive rating selection
   - accessible rating controls
   - decorative star icons

   Notes:
   - used by event review cards and forms
   - rating values range from 1 to 5
================================================== */

export default function EventReviewRating({
    value = 0,
    onChange,
    readOnly = false,
    disabled = false,
    label = "Rating"
}) {
    const stars = [1, 2, 3, 4, 5];

    return (
        <div
            className="event-review-rating"
            role={readOnly ? "img" : "radiogroup"}
            aria-label={readOnly ? `${value} out of 5 stars` : label}
        >
            {stars.map((star) => {
                const isActive = star <= Number(value);

                if (readOnly) {
                    return (
                        <Star
                            key={star}
                            className={
                                isActive
                                    ? "event-review-rating-icon event-review-rating-icon-active"
                                    : "event-review-rating-icon"
                            }
                            aria-hidden="true"
                        />
                    );
                }

                return (
                    <button
                        key={star}
                        type="button"
                        className="event-review-rating-button"
                        role="radio"
                        aria-checked={Number(value) === star}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        disabled={disabled}
                        onClick={() => onChange?.(star)}
                    >
                        <Star
                            className={
                                isActive
                                    ? "event-review-rating-icon event-review-rating-icon-active"
                                    : "event-review-rating-icon"
                            }
                            aria-hidden="true"
                        />
                    </button>
                );
            })}
        </div>
    );
}
