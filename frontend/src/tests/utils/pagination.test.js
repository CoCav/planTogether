import { describe, expect, it, vi } from "vitest";

import { fetchAllPaginated } from "../../utils/pagination";

/* ==================================================
   PAGINATION UTILS TESTS
   Tests paginated fetching and merging helpers

   Handles:
   - single page fetching
   - multiple page fetching
   - item extraction
   - page parameter forwarding
   - fallback pagination behavior
   - error propagation
================================================== */

describe("pagination utils", () => {

    /* =============================
       SINGLE PAGE
    ============================= */

    it("should fetch a single page", async () => {
        const fetchPage = vi.fn().mockResolvedValue({
            items: [1, 2],
            totalPages: 1
        });

        const getItems = vi.fn((payload) => payload.items);

        const result = await fetchAllPaginated({
            fetchPage,
            getItems
        });

        expect(fetchPage).toHaveBeenCalledTimes(1);

        expect(getItems).toHaveBeenCalledWith({
            items: [1, 2],
            totalPages: 1
        });

        expect(result).toEqual([1, 2]);
    });

    /* =============================
       MULTIPLE PAGES
    ============================= */

    it("should fetch multiple pages and merge results", async () => {
        const fetchPage = vi.fn()
            .mockResolvedValueOnce({
                items: [1, 2],
                totalPages: 2
            })
            .mockResolvedValueOnce({
                items: [3, 4],
                totalPages: 2
            });

        const getItems = vi.fn((payload) => payload.items);

        const result = await fetchAllPaginated({
            fetchPage,
            getItems
        });

        expect(fetchPage).toHaveBeenCalledTimes(2);

        expect(result).toEqual([1, 2, 3, 4]);
    });

    /* =============================
       PAGE PARAMETERS
    ============================= */

    it("should pass correct page parameters", async () => {
        const fetchPage = vi.fn()
            .mockResolvedValueOnce({
                items: [],
                totalPages: 2
            })
            .mockResolvedValueOnce({
                items: [],
                totalPages: 2
            });

        const getItems = vi.fn((payload) => payload.items);

        await fetchAllPaginated({
            fetchPage,
            getItems,
            pageSize: 5
        });

        expect(fetchPage).toHaveBeenNthCalledWith(1, {
            page: 1,
            pageSize: 5
        });

        expect(fetchPage).toHaveBeenNthCalledWith(2, {
            page: 2,
            pageSize: 5
        });
    });

    /* =============================
       FALLBACKS
    ============================= */

    it("should default totalPages to 1 when missing", async () => {
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

    /* =============================
       ERRORS
    ============================= */

    it("should propagate errors from fetchPage", async () => {
        const fetchPage = vi.fn().mockRejectedValue(
            new Error("API error")
        );

        const getItems = vi.fn();

        await expect(
            fetchAllPaginated({
                fetchPage,
                getItems
            })
        ).rejects.toThrow("API error");
    });
});
