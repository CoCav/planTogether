import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import EmptyState from "../../../components/ui/EmptyState";

/* ==================================================
   EMPTY STATE TESTS
   Tests reusable empty state rendering

   Handles:
   - title rendering
   - description rendering
   - icon rendering
   - children fallback rendering
================================================== */

describe("EmptyState", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderEmptyState = (props = {}) => {
        return render(
            <EmptyState {...props}>
                {props.children}
            </EmptyState>
        );
    };

    /* =============================
       TITLE / DESCRIPTION
    ============================= */

    it("should render title", () => {
        renderEmptyState({
            title: "No events found"
        });

        expect(
            screen.getByRole("heading", {
                level: 3,
                name: "No events found"
            })
        ).toBeInTheDocument();
    });

    it("should render description", () => {
        renderEmptyState({
            title: "No events found",
            description: "Try changing your filters."
        });

        expect(screen.getByText("Try changing your filters.")).toBeInTheDocument();
    });

    /* =============================
       ICON
    ============================= */

    it("should render optional icon", () => {
        renderEmptyState({
            icon: "📭",
            title: "Nothing here"
        });

        expect(screen.getByText("📭")).toHaveClass("empty-state-icon");
    });

    /* =============================
       FALLBACK CONTENT
    ============================= */

    it("should render children when no title is provided", () => {
        renderEmptyState({
            children: "No data found."
        });

        expect(screen.getByText("No data found.")).toBeInTheDocument();
    });

    it("should prioritize title over children", () => {
        renderEmptyState({
            title: "No events found",
            children: "Fallback content"
        });

        expect(screen.getByText("No events found")).toBeInTheDocument();

        expect(screen.queryByText("Fallback content")).not.toBeInTheDocument();
    });
});
