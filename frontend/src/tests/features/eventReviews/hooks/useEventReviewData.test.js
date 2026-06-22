import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useEventReviewData from "../../../../features/eventReviews/hooks/useEventReviewData";

import { getEventReviews } from "../../../../api/eventReviews/eventReviewApi";

/* ==================================================
   USE EVENT REVIEW DATA TESTS
   Tests event review data loading and pagination

   Handles:
   - initial review state
   - initial pagination state
   - paginated event review loading
   - review response normalization
   - pagination metadata normalization
   - missing event ID guard
   - loading state
   - error state
   - manual state setters

   Notes:
   - review mutations are tested in useEventReviewActions
   - review pagination comes from GET /events/:eventId/reviews
================================================== */

vi.mock("../../../../api/eventReviews/eventReviewApi", () => ({
    getEventReviews: vi.fn()
}));

describe("useEventReviewData", () => {

    /* =============================
       TEST DATA
    ============================= */

    const reviews = [
        {
            id: 1,
            eventId: 10,
            userId: 2,
            comment: "Great event!",
            createdAt: "2026-06-15T10:00:00.000Z",
            user: {
                id: 2,
                name: "Alice",
                avatar: "/uploads/avatars/alice.png"
            }
        }
    ];

    const apiResponse = {
        success: true,
        page: 1,
        pageSize: 4,
        totalReviews: 1,
        totalPages: 1,
        reviews
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const setupHook = (props = {}) => {
        return renderHook(() =>
            useEventReviewData({
                eventId: 10,
                ...props
            })
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       INITIAL STATE
    ============================= */

    it("should initialize review and pagination state", () => {
        const { result } = setupHook();

        expect(result.current.reviews).toEqual([]);

        expect(result.current.pagination).toEqual({
            page: 1,
            pageSize: 10,
            totalPages: 1,
            totalReviews: 0
        });

        expect(result.current.error).toBe("");
        expect(result.current.isLoading).toBe(false);
    });

    /* =============================
       REVIEW LOADING
    ============================= */

    it("should load and normalize event reviews", async () => {
        getEventReviews.mockResolvedValue(apiResponse);

        const { result } = setupHook();

        await act(async () => {
            await result.current.loadReviews();
        });

        expect(getEventReviews).toHaveBeenCalledWith(10, {
            page: 1,
            pageSize: 10
        });

        expect(result.current.pagination).toEqual({
            page: 1,
            pageSize: 4,
            totalPages: 1,
            totalReviews: 1
        });

        expect(result.current.reviews).toEqual([
            expect.objectContaining({
                id: 1,
                eventId: 10,
                userId: 2,
                comment: "Great event!"
            })
        ]);

        expect(result.current.error).toBe("");
        expect(result.current.isLoading).toBe(false);
    });

    it("should load the requested review page with configured page size", async () => {
        getEventReviews.mockResolvedValue({
            ...apiResponse,
            page: 2,
            pageSize: 4,
            totalReviews: 8,
            totalPages: 2
        });

        const { result } = setupHook({
            pageSize: 4
        });

        await act(async () => {
            await result.current.loadReviews(2);
        });

        expect(getEventReviews).toHaveBeenCalledWith(10, {
            page: 2,
            pageSize: 4
        });

        expect(result.current.pagination).toEqual({
            page: 2,
            pageSize: 4,
            totalPages: 2,
            totalReviews: 8
        });
    });

    it("should not load reviews when event ID is missing", async () => {
        const { result } = setupHook({
            eventId: null
        });

        await act(async () => {
            await result.current.loadReviews();
        });

        expect(getEventReviews).not.toHaveBeenCalled();
        expect(result.current.reviews).toEqual([]);
        expect(result.current.isLoading).toBe(false);
    });

    it("should expose loading state while reviews are loading", async () => {
        let resolveReviews;

        getEventReviews.mockImplementation(() => new Promise((resolve) => {
            resolveReviews = resolve;
        }));

        const { result } = setupHook();

        await act(async () => {
            result.current.loadReviews();
        });

        expect(result.current.isLoading).toBe(true);

        await act(async () => {
            resolveReviews(apiResponse);
        });

        expect(result.current.isLoading).toBe(false);
    });

    /* =============================
       ERROR HANDLING
    ============================= */

    it("should handle review loading errors", async () => {
        getEventReviews.mockRejectedValue(new Error("Request failed"));

        const { result } = setupHook();

        await act(async () => {
            await result.current.loadReviews();
        });

        expect(result.current.error).toBe("Request failed");
        expect(result.current.reviews).toEqual([]);
        expect(result.current.isLoading).toBe(false);
    });

    it("should clear previous error before loading reviews again", async () => {
        getEventReviews
            .mockRejectedValueOnce(new Error("Request failed"))
            .mockResolvedValueOnce(apiResponse);

        const { result } = setupHook();

        await act(async () => {
            await result.current.loadReviews();
        });

        expect(result.current.error).toBe("Request failed");

        await act(async () => {
            await result.current.loadReviews();
        });

        expect(result.current.error).toBe("");
        expect(result.current.reviews).toHaveLength(1);
    });

    /* =============================
       MANUAL STATE
    ============================= */

    it("should expose review state setter", () => {
        const { result } = setupHook();

        act(() => {
            result.current.setReviews(reviews);
        });

        expect(result.current.reviews).toEqual(reviews);
    });

    it("should expose pagination state setter", () => {
        const { result } = setupHook();

        act(() => {
            result.current.setPagination({
                page: 2,
                pageSize: 4,
                totalPages: 3,
                totalReviews: 12
            });
        });

        expect(result.current.pagination).toEqual({
            page: 2,
            pageSize: 4,
            totalPages: 3,
            totalReviews: 12
        });
    });

    it("should expose error state setter", () => {
        const { result } = setupHook();

        act(() => {
            result.current.setError("Custom error");
        });

        expect(result.current.error).toBe("Custom error");
    });
});
