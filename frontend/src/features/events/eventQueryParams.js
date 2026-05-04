/* ==================================================
   EVENT QUERY PARAMS
   Handles URL ↔ filters synchronization

   Handles:
   - parsing filters from URL
   - parsing view and pagination
   - building URL params from state
================================================== */

import { getDefaultEventFilters } from "./eventFilters";

export const FILTER_QUERY_KEYS = [
    "search",
    "creator",
    "type",
    "theme",
    "mode",
    "location",
    "date",
    "startDate",
    "endDate",
    "sortBy",
    "order"
];

/* =========================
   View from URL
========================= */
export const getInitialViewFromUrl = (searchParams, views) => {
    const view = searchParams.get("view");

    return views.some((item) => item.key === view) ? view : "all";
};

/* =========================
   Page from URL
========================= */
export const getInitialPageFromUrl = (searchParams) => {
    const page = Number(searchParams.get("page"));

    return Number.isInteger(page) && page > 0 ? page : 1;
};

/* =========================
   Filters from URL
========================= */
export const getInitialFiltersFromUrl = (searchParams) => {
    const filters = getDefaultEventFilters();

    FILTER_QUERY_KEYS.forEach((key) => {
        const value = searchParams.get(key);

        if (value !== null) {
            filters[key] = value;
        }
    });

    return filters;
};

/* =========================
   Build URL params from state
========================= */
export const buildSearchParams = (filters, page, view) => {
    const params = new URLSearchParams();

    if (view !== "all") {
        params.set("view", view);
    }

    if (page > 1) {
        params.set("page", String(page));
    }

    Object.entries(filters).forEach(([key, value]) => {
        if (String(value).trim() !== "") {
            params.set(key, value);
        }
    });

    return params;
};
