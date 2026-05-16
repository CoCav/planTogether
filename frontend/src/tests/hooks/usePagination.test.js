import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import usePagination from "../../hooks/usePagination";

/* ==================================================
   USE PAGINATION TESTS
   Tests pagination navigation helpers

   Handles:
   - previous page navigation
   - next page navigation
   - pagination boundaries
================================================== */

describe("usePagination", () => {

    /* =============================
       PREVIOUS PAGE
    ============================= */

    it("should go to previous page when available", async () => {
        const onPageChange = vi.fn();

        const { result } = renderHook(() =>
            usePagination({
                page: 3,
                totalPages: 5,
                onPageChange
            })
        );

        await act(async () => {
            await result.current.goToPreviousPage();
        });

        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it("should not go to previous page when already on first page", async () => {
        const onPageChange = vi.fn();

        const { result } = renderHook(() =>
            usePagination({
                page: 1,
                totalPages: 5,
                onPageChange
            })
        );

        await act(async () => {
            await result.current.goToPreviousPage();
        });

        expect(onPageChange).not.toHaveBeenCalled();
    });

    /* =============================
       NEXT PAGE
    ============================= */

    it("should go to next page when available", async () => {
        const onPageChange = vi.fn();

        const { result } = renderHook(() =>
            usePagination({
                page: 2,
                totalPages: 5,
                onPageChange
            })
        );

        await act(async () => {
            await result.current.goToNextPage();
        });

        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it("should not go to next page when already on last page", async () => {
        const onPageChange = vi.fn();

        const { result } = renderHook(() =>
            usePagination({
                page: 5,
                totalPages: 5,
                onPageChange
            })
        );

        await act(async () => {
            await result.current.goToNextPage();
        });

        expect(onPageChange).not.toHaveBeenCalled();
    });
});
