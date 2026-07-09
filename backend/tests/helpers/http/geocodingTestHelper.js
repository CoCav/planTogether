const request = require("supertest");

const app = require("../../../src/app");

/* ==========================================================================
   Geocoding Test Helper

   Builds reusable geocoding HTTP helpers.

   Responsibilities
   - Search locations through authenticated geocoding endpoint
   - Search locations through public geocoding endpoint

   Notes
   - Shared across geocoding integration tests.
   - Auth headers can be passed directly to Supertest `.set()`.
=========================================================================== */

/* =============================
   GEOCODING ACTIONS
============================= */

const searchLocations = ({
    headers = {},
    query = {}
} = {}) => {
    return request(app)
        .get("/api/geocoding/search")
        .set(headers)
        .query(query);
};

const publicSearchLocations = ({
    headers = {},
    query = {}
} = {}) => {
    return request(app)
        .get("/api/geocoding/public-search")
        .set(headers)
        .query(query);
};

module.exports = {
    searchLocations,
    publicSearchLocations
};
