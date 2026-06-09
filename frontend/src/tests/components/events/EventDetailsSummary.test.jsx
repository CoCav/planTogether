import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import EventDetailsSummary from "../../../components/events/EventDetailsSummary";

import { getEventModeLabel } from "../../../features/shared/constants/eventModes";

import { createEvent } from "../../factories/events/eventFactory";

/* ==================================================
   EVENT DETAILS SUMMARY TESTS
   Tests practical event metadata rendering

   Handles:
   - schedule and time display
   - registration deadline display
   - mode, location and capacity display
   - optional metadata visibility
   - decorative metadata icon accessibility

   Notes:
   - focuses on metadata rendering
   - location visibility is controlled by props
   - uses reusable render helper
================================================== */

describe("EventDetailsSummary", () => {

    /* =============================
       TEST DATA
    ============================= */

    const event = createEvent();

    const baseProps = {
        mode: getEventModeLabel(event.mode),
        location: event.location,
        capacity: `${event.maxParticipants} attendees`,
        date: "20/12/2026",
        time: "10:00 - 12:00",
        registrationDeadline: "19/12/2026"
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderEventDetailsSummary = (props = {}) => {
        return render(
            <EventDetailsSummary
                {...baseProps}
                {...props}
            />
        );
    };

    /* =============================
       METADATA RENDERING
    ============================= */

    it("should display event summary information", () => {
        renderEventDetailsSummary();

        expect(screen.getByText("In person")).toBeInTheDocument();
        expect(screen.getByText("Montreal")).toBeInTheDocument();
        expect(screen.getByText("10 attendees")).toBeInTheDocument();
        expect(screen.getByText("20/12/2026")).toBeInTheDocument();
        expect(screen.getByText("10:00 - 12:00")).toBeInTheDocument();
        expect(screen.getByText("19/12/2026")).toBeInTheDocument();
    });

    it("should render metadata labels", () => {
        renderEventDetailsSummary();

        expect(screen.getByText("Schedule")).toBeInTheDocument();
        expect(screen.getByText("Time")).toBeInTheDocument();
        expect(screen.getByText("Registration deadline")).toBeInTheDocument();
        expect(screen.getByText("Mode")).toBeInTheDocument();
        expect(screen.getByText("Location")).toBeInTheDocument();
        expect(screen.getByText("Capacity")).toBeInTheDocument();
    });

    it("should hide decorative icons from assistive technologies", () => {
        renderEventDetailsSummary();

        const icons = document.querySelectorAll(".event-details-summary-icon[aria-hidden='true']");

        expect(icons).toHaveLength(6);
    });

    /* =============================
       OPTIONAL FIELDS
    ============================= */

    it("should hide capacity when not provided", () => {
        renderEventDetailsSummary({
            capacity: null
        });

        expect(screen.queryByText(/^Capacity$/i)).not.toBeInTheDocument();
    });

    it("should hide registration deadline when not provided", () => {
        renderEventDetailsSummary({
            registrationDeadline: null
        });

        expect(screen.queryByText(/^Registration deadline$/i)).not.toBeInTheDocument();
    });

    it("should hide location when not provided", () => {
        renderEventDetailsSummary({
            location: null
        });

        expect(screen.queryByText(/^Location$/i)).not.toBeInTheDocument();
    });
});
