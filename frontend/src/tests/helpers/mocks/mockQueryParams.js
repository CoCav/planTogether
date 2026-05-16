import { vi } from "vitest";

/* ==================================================
   QUERY PARAMS MOCK HELPERS

   Handles:
   - URLSearchParams creation
   - query param string generation
   - React Router search param mocks

   Notes:
   - shared across query param and routing tests
================================================== */

/* =============================
   URL SEARCH PARAMS
============================= */

// Create URLSearchParams from an object
export const createMockSearchParams = (params = {}) => {

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return;
        }

        searchParams.set(key, String(value));
    });

    return searchParams;
};

/* =============================
   QUERY STRINGS
============================= */

// Create a query string from params
export const createMockQueryString = (params = {}) => {

    return createMockSearchParams(params).toString();
};

/* =============================
   REACT ROUTER SEARCH PARAMS
============================= */

// Create React Router-like search params tuple
export const createMockUseSearchParams = (params = {}) => {

    const searchParams = createMockSearchParams(params);

    return [
        searchParams,
        vi.fn()
    ];
};
