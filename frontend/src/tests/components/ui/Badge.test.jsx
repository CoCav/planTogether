import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import Badge from "../../../components/ui/Badge";

import { EVENT_ROLES } from "../../../features/shared/eventRoles";

/* ==================================================
   BADGE TESTS
   Tests role-based and custom badge rendering

   Handles:
   - role badge rendering
   - role badge variants
   - custom variants and labels
   - children fallback labels
   - custom class support
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

        expect(screen.getByText(/organizer/i)).toHaveClass("badge-organizer");
    });

    it("should render co-organizer badge", () => {
        renderBadge({
            role: EVENT_ROLES.CO_ORGANIZER
        });

        expect(screen.getByText(/co-organizer/i)).toHaveClass("badge-co-organizer");
    });

    it("should render participant badge", () => {
        renderBadge({
            role: EVENT_ROLES.PARTICIPANT
        });

        expect(screen.getByText(/participant/i)).toHaveClass("badge-participant");
    });

    /* =============================
       CUSTOM BADGES
    ============================= */

    it("should render custom variant and label", () => {
        renderBadge({
            variant: "custom",
            label: "Custom Label"
        });

        expect(screen.getByText("Custom Label")).toHaveClass("badge-custom");
    });

    it("should use children as label", () => {
        renderBadge({
            variant: "info",
            children: "Child Label"
        });

        expect(
            screen.getByText("Child Label")
        ).toHaveClass("badge-info");
    });

    it("should support custom class name", () => {
        renderBadge({
            variant: "info",
            label: "Custom Badge",
            className: "custom-badge"
        });

        expect(screen.getByText("Custom Badge")).toHaveClass("custom-badge");
    });

    /* =============================
       SAFETY CHECK
    ============================= */

    it("should render nothing when no label or variant is provided", () => {
        const { container } = renderBadge();

        expect(container).toBeEmptyDOMElement();
    });
});
