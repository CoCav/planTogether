import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "../../../components/ui/EmptyState";

/* ==================================================
   EMPTY STATE TESTS
   Tests reusable empty state rendering
================================================== */

describe("EmptyState", () => {
    it("renders children when no title is provided", () => {
        render(<EmptyState>No data found.</EmptyState>);

        expect(screen.getByText("No data found.")).toBeInTheDocument();
    });

    it("renders title and description", () => {
        render(
            <EmptyState
                title="No events found"
                description="Try changing your filters."
            />
        );

        expect(screen.getByText("No events found")).toBeInTheDocument();
        expect(screen.getByText("Try changing your filters.")).toBeInTheDocument();
    });

    it("renders optional icon", () => {
        render(<EmptyState icon="📭" title="Nothing here" />);

        expect(screen.getByText("📭")).toHaveClass("empty-state-icon");
    });
});
