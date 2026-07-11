const {
    createNominatimFetchResponse,
    createNominatimResult
} = require("../factories/geocodingFactory");

/* ==========================================================================
   Jest Test Setup

   Configures shared test behavior.

   Responsibilities
   - Prevent real geocoding provider requests
   - Provide a valid default geocoding response
   - Reset shared mocks between tests

   Notes
   - Individual tests can override global.fetch when testing provider behavior.
=========================================================================== */

beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue(
        createNominatimFetchResponse({
            results: [
                createNominatimResult({
                    display_name: "Montréal, Québec, Canada",
                    lat: "45.5031824",
                    lon: "-73.5698065",
                    address: {
                        road: "Rue Sainte-Catherine O",
                        house_number: "1500",
                        city: "Montréal",
                        state: "Québec",
                        postcode: "H3G 1S8",
                        country: "Canada"
                    }
                })
            ]
        })
    );
});

afterEach(() => {
    jest.clearAllMocks();
});
