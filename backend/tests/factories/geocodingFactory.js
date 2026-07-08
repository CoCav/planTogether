/* ==========================================================================
   Geocoding Test Factory

   Builds reusable geocoding test data.

   Responsibilities
   - Build geocoding search queries
   - Build provider result payloads
   - Build normalized location records
   - Build cached location model mocks
   - Support flexible test overrides

   Notes
   - Shared across geocoding service, controller and validator tests.
=========================================================================== */

const createGeocodingQuery = (overrides = {}) => ({
    q: "Montreal",
    ...overrides
});

const createNominatimResult = (overrides = {}) => ({
    place_id: 123,
    display_name: "Montreal, Quebec, Canada",
    lat: "45.5017",
    lon: "-73.5673",
    address: {
        city: "Montreal",
        state: "Quebec",
        country: "Canada",
        postcode: "H2X"
    },
    ...overrides
});

const createNormalizedLocation = (overrides = {}) => ({
    id: 1,
    query: "montreal",
    label: "Montreal, Quebec, Canada",
    streetAddress: null,
    city: "Montreal",
    region: "Quebec",
    postalCode: "H2X",
    country: "Canada",
    latitude: 45.5017,
    longitude: -73.5673,
    provider: "nominatim",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides
});

const createMockLocationModel = (overrides = {}) => ({
    ...createNormalizedLocation(),
    update: jest.fn(),
    toJSON() {
        const {
            update,
            toJSON,
            ...data
        } = this;

        return data;
    },
    ...overrides
});

module.exports = {
    createGeocodingQuery,
    createNominatimResult,
    createNormalizedLocation,
    createMockLocationModel
};
