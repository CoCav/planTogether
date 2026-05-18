import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Pagination from "../../../components/ui/Pagination";

/* ==================================================
   PAGINATION TESTS
   Tests pagination controls rendering and actions

   Handles:
   - hidden pagination for single-page data
   - current page information
   - previous button disabled state
   - next button disabled state
   - navigation callbacks
   - accessible pagination landmark

   Notes:
   - focuses on reusable pagination UI behavior
================================================== */

describe("Pagination", () => {

    /* =============================
       HIDDEN STATE
    ============================= */

    it("renders nothing when there is only one page", () => {
        const { container } = render(
            <Pagination
                page={1}
                totalPages={1}
                onPrevious={vi.fn()}
                onNext={vi.fn()}
            />
        );

        expect(container).toBeEmptyDOMElement();
    });

    /* =============================
       PAGE INFORMATION
    ============================= */

    it("renders current page information", () => {
        render(
            <Pagination
                page={2}
                totalPages={5}
                onPrevious={vi.fn()}
                onNext={vi.fn()}
            />
        );

        expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
    });

    /* =============================
       DISABLED STATES
    ============================= */

    it("disables previous button on first page", () => {
        render(
            <Pagination
                page={1}
                totalPages={5}
                onPrevious={vi.fn()}
                onNext={vi.fn()}
            />
        );

        expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
        expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled();
    });

    it("disables next button on last page", () => {
        render(
            <Pagination
                page={5}
                totalPages={5}
                onPrevious={vi.fn()}
                onNext={vi.fn()}
            />
        );

        expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
        expect(screen.getByRole("button", { name: /previous/i })).not.toBeDisabled();
    });

    /* =============================
       NAVIGATION CALLBACKS
    ============================= */

    it("calls navigation handlers", () => {
        const onPrevious = vi.fn();
        const onNext = vi.fn();

        render(
            <Pagination
                page={2}
                totalPages={5}
                onPrevious={onPrevious}
                onNext={onNext}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /previous/i }));
        fireEvent.click(screen.getByRole("button", { name: /next/i }));

        expect(onPrevious).toHaveBeenCalled();
        expect(onNext).toHaveBeenCalled();
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("renders accessible pagination landmark with custom label", () => {
        render(
            <Pagination
                page={2}
                totalPages={5}
                label="Events pagination"
                onPrevious={vi.fn()}
                onNext={vi.fn()}
            />
        );

        expect(
            screen.getByRole("navigation", {
                name: /events pagination/i
            })
        ).toBeInTheDocument();

        expect(screen.getByText("Page 2 of 5")).toHaveAttribute("aria-live", "polite");
    });
});
