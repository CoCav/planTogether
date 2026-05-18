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

   Notes:
   - focuses on reusable loading UI behavior
================================================== */

describe("LoadingState", () => {

    /* =============================
       DEFAULT STATE
    ============================= */

    it("renders default loading text", () => {
        render(<LoadingState />);

        expect(screen.getByText("Loading...")).toHaveClass("loading-state");
    });

    /* =============================
       CUSTOM CONTENT
    ============================= */

    it("renders custom loading text", () => {
        render(
            <LoadingState>
                Loading events...
            </LoadingState>
        );

        expect(screen.getByText("Loading events...")).toBeInTheDocument();
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("renders an accessible status role", () => {
        render(<LoadingState />);

        expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    });
});
