/* ==================================================
   EVENT DETAILS SUMMARY
   Displays key event information in a compact summary

   Handles:
   - event type and theme
   - mode and location
   - capacity
   - date and time
   - registration deadline
================================================== */

export default function EventDetailsSummary({
    type,
    theme,
    mode,
    location,
    capacity,
    date,
    time,
    registrationDeadline
}) {

    return (
        <dl className="event-details-summary">
            <div className="event-details-summary-item">
                <dt className="event-details-summary-label">🏷️ Type</dt>
                <dd className="event-details-summary-value">{type}</dd>
            </div>

            <div className="event-details-summary-item">
                <dt className="event-details-summary-label">🎯 Theme</dt>
                <dd className="event-details-summary-value">{theme}</dd>
            </div>

            <div className="event-details-summary-item">
                <dt className="event-details-summary-label">📍 Mode</dt>
                <dd className="event-details-summary-value">{mode}</dd>
            </div>

            <div className="event-details-summary-item">
                <dt className="event-details-summary-label">📍 Location</dt>
                <dd className="event-details-summary-value">{location}</dd>
            </div>

            {capacity && (
                <div className="event-details-summary-item">
                    <dt className="event-details-summary-label">👥 Capacity</dt>
                    <dd className="event-details-summary-value">{capacity}</dd>
                </div>
            )}

            <div className="event-details-summary-item">
                <dt className="event-details-summary-label">📅 Date</dt>
                <dd className="event-details-summary-value">{date}</dd>
            </div>

            <div className="event-details-summary-item">
                <dt className="event-details-summary-label">🕒 Time</dt>
                <dd className="event-details-summary-value">{time}</dd>
            </div>

            {registrationDeadline && (
                <div className="event-details-summary-item">
                    <dt className="event-details-summary-label">
                        ⏳ Registration deadline
                    </dt>
                    <dd className="event-details-summary-value">
                        {registrationDeadline}
                    </dd>
                </div>
            )}
        </dl>
    );
}
