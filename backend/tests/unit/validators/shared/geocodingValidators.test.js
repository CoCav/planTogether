const { structuredLocationValidators } = require("../../../../src/validators/shared/geocodingValidators");

const {
    runValidation,
    getValidationMessages
} = require("../../../helpers/validation/validationTestHelper");

/* ==========================================================================
   Shared Geocoding Validators Unit Tests

   Tests reusable structured location validators.

   Responsibilities
   - Test optional structured location fields
   - Test text field sanitization
   - Test latitude validation and conversion
   - Test longitude validation and conversion
   - Test nullable location values

   Notes
   - Structured location fields are optional.
   - Latitude and longitude are converted to numbers after validation.
=========================================================================== */

describe("shared geocoding validators", () => {

    /* =============================
       OPTIONAL LOCATION FIELDS
    ============================= */

    describe("Optional location fields", () => {
        it("accepts an empty structured location payload", async () => {
            const { errors } = await runValidation(structuredLocationValidators);

            expect(errors).toHaveLength(0);
        });

        it("accepts nullable structured location values", async () => {
            const { errors } = await runValidation(structuredLocationValidators, {
                body: {
                    locationLabel: null,
                    streetAddress: null,
                    city: null,
                    region: null,
                    postalCode: null,
                    country: null,
                    latitude: null,
                    longitude: null
                }
            });

            expect(errors).toHaveLength(0);
        });
    });

    /* =============================
       TEXT FIELD SANITIZATION
    ============================= */

    describe("Text field sanitization", () => {
        const textFieldScenarios = [
            ["locationLabel", "Montreal, Quebec, Canada"],
            ["streetAddress", "1500 Rue Sainte-Catherine O"],
            ["city", "Montreal"],
            ["region", "Quebec"],
            ["postalCode", "H3G 1S8"],
            ["country", "Canada"]
        ];

        it.each(textFieldScenarios)(
            "trims the %s field", async (field, value) => {
                const { errors, req } = await runValidation(structuredLocationValidators, {
                    body: {
                        [field]: `  ${value}  `
                    }
                });

                expect(errors).toHaveLength(0);
                expect(req.body[field]).toBe(value);
            }
        );
    });

    /* =============================
       LATITUDE
    ============================= */

    describe("Latitude validation", () => {
        it.each([
            ["minimum", "-90", -90],
            ["maximum", "90", 90],
            ["decimal", "45.5017", 45.5017]
        ])(
            "accepts and converts the %s latitude", async (_, latitude, expectedLatitude) => {
                const { errors, req } = await runValidation(structuredLocationValidators, {
                    body: {
                        latitude
                    }
                });

                expect(errors).toHaveLength(0);
                expect(req.body.latitude).toBe(expectedLatitude);
            }
        );

        it.each([
            ["below minimum", "-90.1"],
            ["above maximum", "90.1"],
            ["non-numeric", "invalid"]
        ])(
            "rejects a %s latitude", async (_, latitude) => {
                const { errors } = await runValidation(structuredLocationValidators, {
                    body: {
                        latitude
                    }
                });

                expect(getValidationMessages(errors)).toContain("Latitude must be between -90 and 90");
            });
    });

    /* =============================
       LONGITUDE
    ============================= */

    describe("Longitude validation", () => {
        it.each([
            ["minimum", "-180", -180],
            ["maximum", "180", 180],
            ["decimal", "-73.5673", -73.5673]
        ])(
            "accepts and converts the %s longitude", async (_, longitude, expectedLongitude) => {
                const { errors, req } = await runValidation(structuredLocationValidators, {
                    body: {
                        longitude
                    }
                });

                expect(errors).toHaveLength(0);
                expect(req.body.longitude).toBe(expectedLongitude);
            }
        );

        it.each([
            ["below minimum", "-180.1"],
            ["above maximum", "180.1"],
            ["non-numeric", "invalid"]
        ])(
            "rejects a %s longitude", async (_, longitude) => {
                const { errors } = await runValidation(structuredLocationValidators, {
                    body: {
                        longitude
                    }
                });

                expect(getValidationMessages(errors)).toContain("Longitude must be between -180 and 180");
            });
    });
});
