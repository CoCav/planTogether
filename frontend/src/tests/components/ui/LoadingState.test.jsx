import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingState from "../../../components/ui/LoadingState";

/* ==================================================
   LOADING STATE TESTS
   Tests loading message rendering
================================================== */

describe("LoadingState", () => {
    it("renders default loading text", () => {
        render(<LoadingState />);

        expect(screen.getByText("Loading...")).toHaveClass("loading-state");
    });

    it("renders custom loading text", () => {
        render(<LoadingState>Loading events...</LoadingState>);

        expect(screen.getByText("Loading events...")).toBeInTheDocument();
    });
});
