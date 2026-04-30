import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Pagination from "../../../components/ui/Pagination";

/* ==================================================
   PAGINATION TESTS
   Tests pagination controls rendering and actions
================================================== */

describe("Pagination", () => {
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
});
