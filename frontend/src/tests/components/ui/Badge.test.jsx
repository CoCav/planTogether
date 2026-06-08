import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import Badge from "../../../components/ui/Badge";

import { EVENT_ROLES } from "../../../features/shared/constants/eventRoles";
import { EVENT_STATUS } from "../../../features/shared/constants/eventStatus";

/* ==================================================
   BADGE TESTS
   Tests role, status and custom badge rendering

   Handles:
   - role badge rendering
   - role badge variants
   - status badge rendering
   - status badge variants
   - custom variants and labels
   - children fallback labels
   - custom class support
   - decorative icon rendering
   - empty state fallback
================================================== */

describe("Badge", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderBadge = (props = {}) => {
        return render(
            <Badge {...props}>
                {props.children}
            </Badge>
        );
    };

    /* =============================
       ROLE BADGES
    ============================= */

    it("should render organizer badge", () => {
        renderBadge({
            role: EVENT_ROLES.ORGANIZER
        });

        expect(screen.getByText(/organizer/i).closest(".badge")).toHaveClass("badge-organizer");
    });

    it("should render co-organizer badge", () => {
        renderBadge({
            role: EVENT_ROLES.CO_ORGANIZER
        });

        expect(screen.getByText(/co-organizer/i).closest(".badge")).toHaveClass("badge-co-organizer");
    });

    it("should render participant badge", () => {
        renderBadge({
            role: EVENT_ROLES.PARTICIPANT
        });

        expect(screen.getByText(/participant/i).closest(".badge")).toHaveClass("badge-participant");
    });

    /* =============================
       STATUS BADGES
    ============================= */

    it("should render upcoming status badge", () => {
        renderBadge({
            status: EVENT_STATUS.UPCOMING
        });

        expect(screen.getByText("Upcoming").closest(".badge")).toHaveClass("badge-upcoming");
    });

    it("should render ongoing status badge", () => {
        renderBadge({
            status: EVENT_STATUS.ONGOING
        });

        expect(screen.getByText("Ongoing").closest(".badge")).toHaveClass("badge-ongoing");
    });

    it("should render ended status badge", () => {
        renderBadge({
            status: EVENT_STATUS.PAST
        });

        expect(screen.getByText("Ended").closest(".badge")).toHaveClass("badge-past");
    });

    /* =============================
       CUSTOM BADGES
    ============================= */

    it("should render custom variant and label", () => {
        renderBadge({
            variant: "custom",
            label: "Custom Label"
        });

        expect(screen.getByText("Custom Label").closest(".badge")).toHaveClass("badge-custom");
    });

    it("should use children as label", () => {
        renderBadge({
            variant: "info",
            children: "Child Label"
        });

        expect(screen.getByText("Child Label").closest(".badge")).toHaveClass("badge-info");
    });

    it("should support custom class name", () => {
        renderBadge({
            variant: "info",
            label: "Custom Badge",
            className: "custom-badge"
        });

        expect(screen.getByText("Custom Badge").closest(".badge")).toHaveClass("custom-badge");
    });

    /* =============================
       ICON
    ============================= */

    it("should render decorative icon when config provides one", () => {
        renderBadge({
            role: EVENT_ROLES.ORGANIZER
        });

        const icon = document.querySelector(".badge-icon");

        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("aria-hidden", "true");
    });

    /* =============================
       SAFETY CHECK
    ============================= */

    it("should render nothing when no label or variant is provided", () => {
        const { container } = renderBadge();

        expect(container).toBeEmptyDOMElement();
    });
});
