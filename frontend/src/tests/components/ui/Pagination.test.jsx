import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

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
================================================== */

describe("Pagination", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderPagination = (props = {}) => {
        return render(
            <Pagination
                page={2}
                totalPages={5}
                onPrevious={vi.fn()}
                onNext={vi.fn()}
                {...props}
            />
        );
    };

    /* =============================
       HIDDEN STATE
    ============================= */

    it("should render nothing when there is only one page", () => {
        const { container } = renderPagination({
            page: 1,
            totalPages: 1
        });

        expect(container).toBeEmptyDOMElement();
    });

    /* =============================
       PAGE INFORMATION
    ============================= */

    it("should render current page information", () => {
        renderPagination();

        expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
    });

    /* =============================
       DISABLED STATES
    ============================= */

    it("should disable previous button on first page", () => {
        renderPagination({
            page: 1
        });

        expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
        expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled();
    });

    it("should disable next button on last page", () => {
        renderPagination({
            page: 5
        });

        expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
        expect(screen.getByRole("button", { name: /previous/i })).not.toBeDisabled();
    });

    /* =============================
       NAVIGATION CALLBACKS
    ============================= */

    it("should call navigation handlers", () => {
        const onPrevious = vi.fn();
        const onNext = vi.fn();

        renderPagination({
            onPrevious,
            onNext
        });

        fireEvent.click(screen.getByRole("button", { name: /previous/i }));
        fireEvent.click(screen.getByRole("button", { name: /next/i }));

        expect(onPrevious).toHaveBeenCalledTimes(1);
        expect(onNext).toHaveBeenCalledTimes(1);
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("should render accessible pagination landmark with default label", () => {
        renderPagination();

        expect(screen.getByRole("navigation", {
            name: /pagination/i
        })).toBeInTheDocument();
    });

    it("should render accessible pagination landmark with custom label", () => {
        renderPagination({
            label: "Events pagination"
        });

        expect(screen.getByRole("navigation", {
            name: /events pagination/i
        })).toBeInTheDocument();
    });

    it("should announce page information politely", () => {
        renderPagination();

        expect(screen.getByText("Page 2 of 5")).toHaveAttribute("aria-live", "polite");
    });
});
