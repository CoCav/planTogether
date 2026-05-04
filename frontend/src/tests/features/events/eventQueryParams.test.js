import { describe, expect, it } from "vitest";
import { FILTER_QUERY_KEYS, buildSearchParams, getInitialFiltersFromUrl, getInitialPageFromUrl, getInitialViewFromUrl } from "../../../features/events/eventQueryParams";

/* ==================================================
   EVENT QUERY PARAMS TESTS
   Tests URL query params parsing and synchronization
================================================== */

const views = [
    { key: "all" },
    { key: "upcoming" },
    { key: "archives" }
];

describe("eventQueryParams", () => {
    it("contains supported filter query keys", () => {
        expect(FILTER_QUERY_KEYS).toContain("search");
        expect(FILTER_QUERY_KEYS).toContain("creator");
        expect(FILTER_QUERY_KEYS).toContain("sortBy");
        expect(FILTER_QUERY_KEYS).toContain("order");
    });

    it("returns view from URL when valid", () => {
        const searchParams = new URLSearchParams("view=upcoming");

        expect(getInitialViewFromUrl(searchParams, views)).toBe("upcoming");
    });

    it("returns all view when URL view is invalid", () => {
        const searchParams = new URLSearchParams("view=invalid");

        expect(getInitialViewFromUrl(searchParams, views)).toBe("all");
    });

    it("returns all view when URL view is missing", () => {
        const searchParams = new URLSearchParams();

        expect(getInitialViewFromUrl(searchParams, views)).toBe("all");
    });

    it("returns page from URL when valid", () => {
        const searchParams = new URLSearchParams("page=3");

        expect(getInitialPageFromUrl(searchParams)).toBe(3);
    });

    it("returns page 1 when URL page is invalid", () => {
        expect(getInitialPageFromUrl(new URLSearchParams("page=abc"))).toBe(1);
        expect(getInitialPageFromUrl(new URLSearchParams("page=0"))).toBe(1);
        expect(getInitialPageFromUrl(new URLSearchParams("page=-2"))).toBe(1);
    });

    it("returns filters from URL", () => {
        const searchParams = new URLSearchParams(
            "search=music&creator=Luffy&type=Meetup&mode=online&sortBy=title&order=desc"
        );

        expect(getInitialFiltersFromUrl(searchParams)).toMatchObject({
            search: "music",
            creator: "Luffy",
            type: "Meetup",
            mode: "online",
            sortBy: "title",
            order: "desc"
        });
    });

    it("keeps default values for missing filters", () => {
        const searchParams = new URLSearchParams("creator=Luffy");

        expect(getInitialFiltersFromUrl(searchParams)).toMatchObject({
            search: "",
            creator: "Luffy",
            type: "",
            theme: "",
            mode: "",
            location: "",
            date: "",
            startDate: "",
            endDate: "",
            sortBy: "",
            order: "asc"
        });
    });

    it("builds search params from filters, page and view", () => {
        const params = buildSearchParams(
            {
                search: "music",
                creator: "Luffy",
                type: "",
                theme: "",
                mode: "online",
                location: "",
                date: "",
                startDate: "",
                endDate: "",
                sortBy: "title",
                order: "desc"
            },
            2,
            "upcoming"
        );

        expect(params.get("view")).toBe("upcoming");
        expect(params.get("page")).toBe("2");
        expect(params.get("search")).toBe("music");
        expect(params.get("creator")).toBe("Luffy");
        expect(params.get("mode")).toBe("online");
        expect(params.get("sortBy")).toBe("title");
        expect(params.get("order")).toBe("desc");
        expect(params.has("type")).toBe(false);
    });

    it("does not include default view or first page in URL params", () => {
        const params = buildSearchParams(
            {
                search: "",
                creator: "",
                type: "",
                theme: "",
                mode: "",
                location: "",
                date: "",
                startDate: "",
                endDate: "",
                sortBy: "",
                order: "asc"
            },
            1,
            "all"
        );

        expect(params.has("view")).toBe(false);
        expect(params.has("page")).toBe(false);
    });
});
