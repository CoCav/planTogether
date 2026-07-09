/* ==========================================================================
   Geocoding Test Factory

   Builds reusable geocoding test data.

   Responsibilities
   - Build geocoding search queries
   - Build provider result payloads
   - Build normalized location records
   - Build cached location model mocks
   - Build provider fetch responses
   - Support flexible test overrides

   Notes
   - Shared across geocoding service, controller, validator and integration tests.
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
        road: "Rue Sainte-Catherine O",
        house_number: "1500",
        city: "Montreal",
        state: "Quebec",
        country: "Canada",
        postcode: "H2X",
        ...(overrides.address || {})
    },
    ...overrides
});

const createNominatimResults = (...results) => (
    results.length > 0
        ? results
        : [createNominatimResult()]
);

const createNominatimFetchResponse = ({
    ok = true,
    status = 200,
    results = createNominatimResults()
} = {}) => ({
    ok,
    status,
    json: jest.fn().mockResolvedValue(results)
});

const createNormalizedLocation = (overrides = {}) => ({
    id: 1,
    query: "montreal",
    label: "Montreal, Quebec, Canada",
    streetAddress: "1500 Rue Sainte-Catherine O",
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
    createNominatimResults,
    createNominatimFetchResponse,
    createNormalizedLocation,
    createMockLocationModel
};
