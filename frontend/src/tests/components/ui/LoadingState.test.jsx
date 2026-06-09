import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import LoadingState from "../../../components/ui/LoadingState";

/* ==================================================
   LOADING STATE TESTS
   Tests loading feedback rendering and accessibility

   Handles:
   - default loading title
   - custom loading title
   - optional loading description
   - decorative spinner rendering
   - accessible loading status role
   - polite live region behavior
================================================== */

describe("LoadingState", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderLoadingState = (props = {}) => {
        return render(
            <LoadingState {...props} />
        );
    };

    /* =============================
       RENDERING
    ============================= */

    it("should render default loading title", () => {
        render(<LoadingState />);

        expect(
            screen.getByText("Loading...").closest(".loading-state")
        ).toBeInTheDocument();
    });

    it("should render custom loading title", () => {
        renderLoadingState({
            title: "Loading events..."
        });

        expect(screen.getByText("Loading events...")).toBeInTheDocument();
    });

    it("should render decorative spinner", () => {
        render(<LoadingState />);

        const spinner = document.querySelector(".loading-state-spinner");

        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveAttribute("aria-hidden", "true");
    });

    it("should render optional loading description", () => {
        renderLoadingState({
            title: "Loading events...",
            description: "Fetching the latest results."
        });

        expect(screen.getByText("Fetching the latest results.")).toBeInTheDocument();
    });

    it("should not render description when none is provided", () => {
        renderLoadingState();

        expect(document.querySelector(".loading-state-description")).not.toBeInTheDocument();
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("should render an accessible status role", () => {
        render(<LoadingState />);

        expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    });
});
