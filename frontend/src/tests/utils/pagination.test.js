import { describe, expect, it, vi } from "vitest";

import { fetchAllPaginated } from "../../utils/pagination";

import { createMockPaginatedResponse } from "../helpers/mocks/mockPaginatedFetch";

/* ==================================================
   PAGINATION UTILS TESTS
   Tests paginated fetching and merging helpers

   Handles:
   - single page fetching
   - multi-page fetching
   - empty paginated payloads
   - fallback pagination metadata

   Notes:
   - uses reusable paginated fetch mock helpers
================================================== */

describe("pagination", () => {

    /* =============================
       PAGE FETCHING
    ============================= */

    it("should fetch a single page", async () => {
        const fetchPage = vi.fn().mockResolvedValue(
            createMockPaginatedResponse({
                items: [1, 2],
                totalPages: 1
            })
        );

        const getItems = vi.fn((payload) => payload.items);

        const result = await fetchAllPaginated({
            fetchPage,
            getItems
        });

        expect(fetchPage).toHaveBeenCalledTimes(1);

        expect(fetchPage).toHaveBeenCalledWith({
            page: 1,
            pageSize: 10
        });

        expect(result).toEqual([1, 2]);
    });

    it("should fetch multiple pages and merge items", async () => {
        const fetchPage = vi.fn()
            .mockResolvedValueOnce(
                createMockPaginatedResponse({
                    items: [1, 2],
                    page: 1,
                    totalPages: 2
                })
            )
            .mockResolvedValueOnce(
                createMockPaginatedResponse({
                    items: [3, 4],
                    page: 2,
                    totalPages: 2
                })
            );

        const getItems = vi.fn((payload) => payload.items);

        const result = await fetchAllPaginated({
            fetchPage,
            getItems,
            pageSize: 5
        });

        expect(fetchPage).toHaveBeenCalledTimes(2);

        expect(fetchPage).toHaveBeenNthCalledWith(1, {
            page: 1,
            pageSize: 5
        });

        expect(fetchPage).toHaveBeenNthCalledWith(2, {
            page: 2,
            pageSize: 5
        });

        expect(result).toEqual([1, 2, 3, 4]);
    });

    it("should return an empty array when pages contain no items", async () => {
        const fetchPage = vi.fn().mockResolvedValue(
            createMockPaginatedResponse({
                items: [],
                totalPages: 1
            })
        );

        const getItems = vi.fn((payload) => payload.items);

        const result = await fetchAllPaginated({
            fetchPage,
            getItems
        });

        expect(result).toEqual([]);
    });

    it("should fallback to one page when totalPages is missing", async () => {
        const fetchPage = vi.fn().mockResolvedValue({
            items: [1]
        });

        const getItems = vi.fn((payload) => payload.items);

        const result = await fetchAllPaginated({
            fetchPage,
            getItems
        });

        expect(fetchPage).toHaveBeenCalledTimes(1);
        expect(result).toEqual([1]);
    });
});
