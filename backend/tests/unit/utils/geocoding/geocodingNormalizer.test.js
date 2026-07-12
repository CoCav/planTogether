const {
    GEOCODING_PROVIDER,
    pickAddressValue,
    buildStreetAddress,
    normalizeAddress,
    normalizeLocation
} = require("../../../../src/utils/geocoding/geocodingNormalizer");

/* ==========================================================================
   Geocoding Normalizer Utility Unit Tests

   Tests provider response normalization.

   Responsibilities
   - Test provider constant exposure
   - Test structured address value selection
   - Test street address building
   - Test address normalization
   - Test location normalization
   - Test invalid provider coordinates

   Notes
   - Provider coordinates are converted to numbers.
   - Invalid coordinates produce a 502 HTTP error.
=========================================================================== */

describe("geocoding normalizer utility", () => {

    /* =============================
       PROVIDER
    ============================= */

    describe("GEOCODING_PROVIDER", () => {
        it("exposes the configured geocoding provider", () => {
            expect(GEOCODING_PROVIDER).toBe("nominatim");
        });
    });

    /* =============================
       ADDRESS VALUE SELECTION
    ============================= */

    describe("pickAddressValue", () => {
        it("returns the first available address value", () => {
            const result = pickAddressValue(
                {
                    town: "Quebec City",
                    city: "Montreal"
                },
                ["city", "town"]
            );

            expect(result).toBe("Montreal");
        });

        it("falls back to the next available key", () => {
            const result = pickAddressValue(
                {
                    village: "Small Village"
                },
                ["city", "town", "village"]
            );

            expect(result).toBe("Small Village");
        });

        it("returns null when no address key is available", () => {
            expect(pickAddressValue({}, ["city", "town"])).toBeNull();
        });

        it("returns null with default arguments", () => {
            expect(pickAddressValue()).toBeNull();
        });
    });

    /* =============================
       STREET ADDRESS
    ============================= */

    describe("buildStreetAddress", () => {
        it("builds a street address with house number and road", () => {
            expect(
                buildStreetAddress({
                    house_number: "1500",
                    road: "Rue Sainte-Catherine O"
                })
            ).toBe("1500 Rue Sainte-Catherine O");
        });

        it("returns the road when house number is missing", () => {
            expect(buildStreetAddress({
                road: "Rue Sainte-Catherine O"
            })).toBe("Rue Sainte-Catherine O");
        });

        it.each([
            ["pedestrian", "Pedestrian Street"],
            ["footway", "Footway Path"],
            ["path", "Forest Path"],
            ["street", "Main Street"],
            ["residential", "Residential Road"]
        ])(
            "uses the %s field as a road fallback",
            (key, value) => {
                expect(buildStreetAddress({
                    [key]: value
                })).toBe(value);
            }
        );

        it("returns null when no road field is available", () => {
            expect(buildStreetAddress({
                house_number: "1500"
            })).toBeNull();
        });
    });

    /* =============================
       ADDRESS NORMALIZATION
    ============================= */

    describe("normalizeAddress", () => {
        it("normalizes a complete provider address", () => {
            expect(normalizeAddress({
                house_number: "1500",
                road: "Rue Sainte-Catherine O",
                city: "Montreal",
                state: "Quebec",
                postcode: "H3G 1S8",
                country: "Canada"
            })).toEqual({
                streetAddress: "1500 Rue Sainte-Catherine O",
                city: "Montreal",
                region: "Quebec",
                postalCode: "H3G 1S8",
                country: "Canada"
            });
        });

        it("uses city fallback fields", () => {
            expect(normalizeAddress({
                town: "Quebec City"
            }).city).toBe("Quebec City");

            expect(normalizeAddress({
                village: "Small Village"
            }).city).toBe("Small Village");
        });

        it("uses region fallback fields", () => {
            expect(normalizeAddress({
                province: "Quebec"
            }).region).toBe("Quebec");

            expect(normalizeAddress({
                county: "Montreal"
            }).region).toBe("Montreal");
        });

        it("returns null for missing address fields", () => {
            expect(normalizeAddress()).toEqual({
                streetAddress: null,
                city: null,
                region: null,
                postalCode: null,
                country: null
            });
        });
    });

    /* =============================
       LOCATION NORMALIZATION
    ============================= */

    describe("normalizeLocation", () => {
        it("normalizes a provider result", () => {
            const result = normalizeLocation(
                "  Montreal  ",
                {
                    display_name: "Montreal, Quebec, Canada",
                    lat: "45.5017",
                    lon: "-73.5673",
                    address: {
                        house_number: "1500",
                        road: "Rue Sainte-Catherine O",
                        city: "Montreal",
                        state: "Quebec",
                        postcode: "H3G 1S8",
                        country: "Canada"
                    }
                }
            );

            expect(result).toEqual({
                query: "montreal",
                label: "Montreal, Quebec, Canada",
                streetAddress: "1500 Rue Sainte-Catherine O",
                city: "Montreal",
                region: "Quebec",
                postalCode: "H3G 1S8",
                country: "Canada",
                latitude: 45.5017,
                longitude: -73.5673,
                provider: "nominatim"
            });
        });

        it("uses the query as label when display_name is missing", () => {
            const result = normalizeLocation(
                "Montreal",
                {
                    lat: "45.5017",
                    lon: "-73.5673"
                }
            );

            expect(result.label).toBe("Montreal");
        });

        it("normalizes missing address data", () => {
            const result = normalizeLocation(
                "Montreal",
                {
                    display_name: "Montreal",
                    lat: "45.5017",
                    lon: "-73.5673"
                }
            );

            expect(result).toMatchObject({
                streetAddress: null,
                city: null,
                region: null,
                postalCode: null,
                country: null
            });
        });

        it.each([
            ["latitude", { lat: "invalid", lon: "-73.5673" }],
            ["longitude", { lat: "45.5017", lon: "invalid" }]
        ])(
            "throws a 502 error for an invalid %s",
            (_, providerResult) => {
                try {
                    normalizeLocation(
                        "Montreal",
                        providerResult
                    );

                    throw new Error("Expected normalizeLocation to throw");
                } catch (error) {
                    expect(error).toBeInstanceOf(Error);
                    expect(error.message).toBe("Invalid location provider response");
                    expect(error.statusCode).toBe(502);
                }
            }
        );
    });
});
