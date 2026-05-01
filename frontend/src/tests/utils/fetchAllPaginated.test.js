import { describe, it, expect, vi } from "vitest";
import { fetchAllPaginated } from "../../utils/fetchAllPaginated";

/* ==================================================
   FETCH ALL PAGINATED TESTS
   Tests paginated fetching and merging logic
================================================== */

describe("fetchAllPaginated", () => {

    it("fetches a single page", async () => {
        const fetchPage = vi.fn().mockResolvedValue({
            data: { totalPages: 1 }
        });

        const normalizePage = vi.fn().mockReturnValue([1, 2]);

        const result = await fetchAllPaginated({ fetchPage, normalizePage });

        expect(fetchPage).toHaveBeenCalledTimes(1);
        expect(result).toEqual([1, 2]);
    });

    it("fetches multiple pages and merges results", async () => {
        const fetchPage = vi.fn()
            .mockResolvedValueOnce({ data: { totalPages: 2 } })
            .mockResolvedValueOnce({ data: { totalPages: 2 } });

        const normalizePage = vi.fn()
            .mockReturnValueOnce([1, 2])
            .mockReturnValueOnce([3, 4]);

        const result = await fetchAllPaginated({ fetchPage, normalizePage });

        expect(fetchPage).toHaveBeenCalledTimes(2);
        expect(result).toEqual([1, 2, 3, 4]);
    });

    it("passes correct page parameters", async () => {
        const fetchPage = vi.fn()
            .mockResolvedValueOnce({ data: { totalPages: 2 } })
            .mockResolvedValueOnce({ data: { totalPages: 2 } });

        const normalizePage = vi.fn().mockReturnValue([]);

        await fetchAllPaginated({ fetchPage, normalizePage, pageSize: 5 });

        expect(fetchPage).toHaveBeenNthCalledWith(1, { page: 1, pageSize: 5 });
        expect(fetchPage).toHaveBeenNthCalledWith(2, { page: 2, pageSize: 5 });
    });

    it("handles missing totalPages (defaults to 1)", async () => {
        const fetchPage = vi.fn().mockResolvedValue({
            data: {}
        });

        const normalizePage = vi.fn().mockReturnValue([1]);

        const result = await fetchAllPaginated({ fetchPage, normalizePage });

        expect(fetchPage).toHaveBeenCalledTimes(1);
        expect(result).toEqual([1]);
    });

    it("propagates errors from fetchPage", async () => {
        const fetchPage = vi.fn().mockRejectedValue(new Error("API error"));

        const normalizePage = vi.fn();

        await expect(fetchAllPaginated({ fetchPage, normalizePage })).rejects.toThrow("API error");
    });
});
