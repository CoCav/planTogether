import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LoadingState from "../../../components/ui/LoadingState";

/* ==================================================
   LOADING STATE TESTS
   Tests loading message rendering and accessibility

   Handles:
   - default loading message
   - custom loading message
   - accessible loading status role
   - polite live region behavior
================================================== */

describe("LoadingState", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderLoadingState = (children) => {
        return render(
            <LoadingState>
                {children}
            </LoadingState>
        );
    };

    /* =============================
       RENDERING
    ============================= */

    it("should render default loading text", () => {
        render(<LoadingState />);

        expect(screen.getByText("Loading...")).toHaveClass("loading-state");
    });

    it("should render custom loading text", () => {
        renderLoadingState("Loading events...");

        expect(screen.getByText("Loading events...")).toBeInTheDocument();
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("should render an accessible status role", () => {
        render(<LoadingState />);

        expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    });
});
