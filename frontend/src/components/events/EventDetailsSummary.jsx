import { CalendarDays, Clock3, Hourglass, MapPin, MonitorSmartphone, Users } from "lucide-react";

/* ==================================================
   EVENT DETAILS SUMMARY
   Displays practical event information

   Handles:
   - schedule and time display
   - registration deadline display
   - mode, location and capacity display
   - conditional location rendering
   - responsive event metadata layout
   - decorative metadata icons
================================================== */

export default function EventDetailsSummary({
    mode,
    location,
    capacity,
    date,
    time,
    registrationDeadline
}) {

    return (
        <dl className="event-details-summary">
            <div className="event-details-summary-column">
                <div className="event-details-summary-item">
                    <div className="event-details-summary-icon" aria-hidden="true">
                        <CalendarDays />
                    </div>

                    <div>
                        <dt className="event-details-summary-label">Schedule</dt>
                        <dd className="event-details-summary-value">{date}</dd>
                    </div>
                </div>

                <div className="event-details-summary-item">
                    <div className="event-details-summary-icon" aria-hidden="true">
                        <Clock3 />
                    </div>

                    <div>
                        <dt className="event-details-summary-label">Time</dt>
                        <dd className="event-details-summary-value">{time}</dd>
                    </div>
                </div>

                {registrationDeadline && (
                    <div className="event-details-summary-item">
                        <div className="event-details-summary-icon" aria-hidden="true">
                            <Hourglass />
                        </div>

                        <div>
                            <dt className="event-details-summary-label">
                                Registration deadline
                            </dt>

                            <dd className="event-details-summary-value">
                                {registrationDeadline}
                            </dd>
                        </div>
                    </div>
                )}
            </div>

            <div className="event-details-summary-column">
                <div className="event-details-summary-item">
                    <div className="event-details-summary-icon" aria-hidden="true">
                        <MonitorSmartphone />
                    </div>

                    <div>
                        <dt className="event-details-summary-label">Mode</dt>
                        <dd className="event-details-summary-value">{mode}</dd>
                    </div>
                </div>

                {location && (
                    <div className="event-details-summary-item">
                        <div className="event-details-summary-icon" aria-hidden="true">
                            <MapPin />
                        </div>

                        <div>
                            <dt className="event-details-summary-label">Location</dt>
                            <dd className="event-details-summary-value">{location}</dd>
                        </div>
                    </div>
                )}

                {capacity && (
                    <div className="event-details-summary-item">
                        <div className="event-details-summary-icon" aria-hidden="true">
                            <Users />
                        </div>

                        <div>
                            <dt className="event-details-summary-label">Capacity</dt>
                            <dd className="event-details-summary-value">{capacity}</dd>
                        </div>
                    </div>
                )}
            </div>
        </dl>
    );
}
