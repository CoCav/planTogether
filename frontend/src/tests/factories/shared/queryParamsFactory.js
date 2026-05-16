/* ==================================================
   QUERY PARAMS TEST FACTORY

   Handles:
   - generic URLSearchParams generation

   Notes:
   - shared across query param tests
   - accepts params object for flexible scenarios
================================================== */

/* =============================
   QUERY PARAMS
============================= */

// Generate URLSearchParams from an object
export const createQueryParams = (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;

        queryParams.set(key, String(value));
    });

    return queryParams;
};
