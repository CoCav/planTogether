import { describe, expect, it, vi } from "vitest";
import usePagination from "../../../hooks/pagination/usePagination";

/* ==================================================
   USE PAGINATION TESTS
   Tests pagination boundary and navigation logic
================================================== */

describe("usePagination", () => {
    it("loads previous page when not on first page", async () => {
        const onPageChange = vi.fn();

        const { handlePreviousPage } = usePagination({
            page: 2,
            totalPages: 5,
            onPageChange
        });

        await handlePreviousPage();

        expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it("does not load previous page when on first page", async () => {
        const onPageChange = vi.fn();

        const { handlePreviousPage } = usePagination({
            page: 1,
            totalPages: 5,
            onPageChange
        });

        await handlePreviousPage();

        expect(onPageChange).not.toHaveBeenCalled();
    });

    it("loads next page when not on last page", async () => {
        const onPageChange = vi.fn();

        const { handleNextPage } = usePagination({
            page: 2,
            totalPages: 5,
            onPageChange
        });

        await handleNextPage();

        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it("does not load next page when on last page", async () => {
        const onPageChange = vi.fn();

        const { handleNextPage } = usePagination({
            page: 5,
            totalPages: 5,
            onPageChange
        });

        await handleNextPage();

        expect(onPageChange).not.toHaveBeenCalled();
    });
});
