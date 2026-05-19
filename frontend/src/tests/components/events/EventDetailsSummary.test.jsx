import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import EventDetailsSummary from "../../../components/events/EventDetailsSummary";

import { getEventModeLabel } from "../../../features/shared/eventModes";

import { createEvent } from "../../factories/events/eventFactory";

/* ==================================================
   EVENT DETAILS SUMMARY TESTS
   Tests event summary metadata rendering

   Handles:
   - type and theme display
   - mode and location display
   - capacity display
   - date and time display
   - registration deadline display
   - optional field visibility

   Notes:
   - focuses on metadata rendering
   - uses reusable render helper
================================================== */

describe("EventDetailsSummary", () => {

    /* =============================
       TEST DATA
    ============================= */

    const event = createEvent();

    const baseProps = {
        type: event.type,
        theme: event.theme,
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

        expect(screen.getByText("Meetup")).toBeInTheDocument();
        expect(screen.getByText("Tech")).toBeInTheDocument();
        expect(screen.getByText("In person")).toBeInTheDocument();
        expect(screen.getByText("Montreal")).toBeInTheDocument();
        expect(screen.getByText("10 attendees")).toBeInTheDocument();
        expect(screen.getByText("20/12/2026")).toBeInTheDocument();
        expect(screen.getByText("10:00 - 12:00")).toBeInTheDocument();
        expect(screen.getByText("19/12/2026")).toBeInTheDocument();
    });

    /* =============================
       OPTIONAL FIELDS
    ============================= */

    it("should hide capacity when not provided", () => {
        renderEventDetailsSummary({
            capacity: null
        });

        expect(screen.queryByText("👥 Capacity")).not.toBeInTheDocument();
    });

    it("should hide registration deadline when not provided", () => {
        renderEventDetailsSummary({
            registrationDeadline: null
        });

        expect(screen.queryByText("⏳ Registration deadline")).not.toBeInTheDocument();
    });
});
