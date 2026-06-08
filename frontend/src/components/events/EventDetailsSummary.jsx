import { CalendarDays, Clock3, Hourglass, MapPin, MonitorSmartphone, Shapes, Sparkles, Users } from "lucide-react";

/* ==================================================
   EVENT DETAILS SUMMARY
   Displays key event information in a compact summary

   Handles:
   - event type and theme
   - mode and location
   - capacity
   - date and time
   - registration deadline
   - decorative summary icons
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
                <dt className="event-details-summary-label">
                    <Shapes aria-hidden="true" />
                    Type
                </dt>
                <dd className="event-details-summary-value">{type}</dd>
            </div>

            <div className="event-details-summary-item">
                <dt className="event-details-summary-label">
                    <Sparkles aria-hidden="true" />
                    Theme
                </dt>
                <dd className="event-details-summary-value">{theme}</dd>
            </div>

            <div className="event-details-summary-item">
                <dt className="event-details-summary-label">
                    <MonitorSmartphone aria-hidden="true" />
                    Mode
                </dt>
                <dd className="event-details-summary-value">{mode}</dd>
            </div>

            <div className="event-details-summary-item">
                <dt className="event-details-summary-label">
                    <MapPin aria-hidden="true" />
                    Location
                </dt>
                <dd className="event-details-summary-value">{location}</dd>
            </div>

            {capacity && (
                <div className="event-details-summary-item">
                    <dt className="event-details-summary-label">
                        <Users aria-hidden="true" />
                        Capacity
                    </dt>
                    <dd className="event-details-summary-value">{capacity}</dd>
                </div>
            )}

            <div className="event-details-summary-item">
                <dt className="event-details-summary-label">
                    <CalendarDays aria-hidden="true" />
                    Date
                </dt>
                <dd className="event-details-summary-value">{date}</dd>
            </div>

            <div className="event-details-summary-item">
                <dt className="event-details-summary-label">
                    <Clock3 aria-hidden="true" />
                    Time
                </dt>
                <dd className="event-details-summary-value">{time}</dd>
            </div>

            {registrationDeadline && (
                <div className="event-details-summary-item">
                    <dt className="event-details-summary-label">
                        <Hourglass aria-hidden="true" />
                        Registration deadline
                    </dt>
                    <dd className="event-details-summary-value">
                        {registrationDeadline}
                    </dd>
                </div>
            )}
        </dl>
    );
}
