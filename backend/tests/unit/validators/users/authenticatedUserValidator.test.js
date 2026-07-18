const {
    getCurrentUserEventsValidator,
    updateCurrentUserProfileValidator,
    changeCurrentUserPasswordValidator
} = require("../../../../src/validators/users/authenticatedUserValidator");

const {
    runValidation,
    getValidationMessages
} = require("../../../helpers/validation/validationTestHelper");

/* ==========================================================================
   Authenticated User Validator Unit Tests

   Tests authenticated user request validation.

   Responsibilities
   - Test current user event query validation
   - Test current user profile updates
   - Test current user password updates

   Notes
   - Current user identity comes from the authenticated JWT.
=========================================================================== */

describe("authenticated user validator", () => {

    /* =============================
       CURRENT USER EVENTS
    ============================= */

    describe("getCurrentUserEventsValidator", () => {
        it("accepts a valid event query", async () => {
            const { errors } = await runValidation(getCurrentUserEventsValidator, {
                query: {
                    view: "created",
                    page: "2",
                    pageSize: "10",
                    sortBy: "title",
                    order: "desc",
                    status: "upcoming",
                    mode: "online"
                }
            });

            expect(errors).toHaveLength(0);
        });

        it("accepts an empty query", async () => {
            const { errors } = await runValidation(getCurrentUserEventsValidator);

            expect(errors).toHaveLength(0);
        });

        it("rejects an invalid view", async () => {
            const { errors } = await runValidation(getCurrentUserEventsValidator, {
                query: {
                    view: "favorites"
                }
            });

            expect(getValidationMessages(errors)).toContain("View must be one of: created, joined, createdHistory, joinedHistory");
        });
    });

    /* =============================
       PROFILE UPDATE
    ============================= */

    describe("updateCurrentUserProfileValidator", () => {
        it("accepts a valid profile update", async () => {
            const { errors, req } = await runValidation(updateCurrentUserProfileValidator, {
                body: {
                    name: "  Jane Doe  ",
                    email: "  JANE@EXAMPLE.COM  "
                }
            });

            expect(errors).toHaveLength(0);

            expect(req.body.name).toBe("Jane Doe");
            expect(req.body.email).toBe("jane@example.com");
        });

        it("accepts an empty payload", async () => {
            const { errors } = await runValidation(updateCurrentUserProfileValidator);

            expect(errors).toHaveLength(0);
        });

        it("rejects a short name", async () => {
            const { errors } = await runValidation(updateCurrentUserProfileValidator, {
                body: {
                    name: "A"
                }
            });

            expect(getValidationMessages(errors)).toContain("Name must be at least 2 characters long");
        });

        it("rejects an invalid email", async () => {
            const { errors } = await runValidation(updateCurrentUserProfileValidator, {
                body: {
                    email: "invalid"
                }
            });

            expect(getValidationMessages(errors)).toContain("Invalid email");
        });
    });

    /* =============================
       PASSWORD UPDATE
    ============================= */

    describe("changeCurrentUserPasswordValidator", () => {
        it("accepts a valid password change", async () => {
            const { errors } = await runValidation(changeCurrentUserPasswordValidator, {
                body: {
                    currentPassword: "Password123",
                    newPassword: "NewPassword123"
                }
            });

            expect(errors).toHaveLength(0);
        });

        it("requires the current password", async () => {
            const { errors } = await runValidation(changeCurrentUserPasswordValidator, {
                body: {
                    newPassword: "NewPassword123"
                }
            });

            expect(getValidationMessages(errors)).toContain("Current password is required");
        });

        it("requires the new password", async () => {
            const { errors } = await runValidation(changeCurrentUserPasswordValidator, {
                body: {
                    currentPassword: "Password123"
                }
            });

            expect(getValidationMessages(errors)).toContain("New password is required");
        });

        it.each([[
            "too short",
            "Pass1",
            "New password must be at least 8 characters long"
        ], [
            "without number",
            "NewPassword",
            "New password must contain a number"
        ], [
            "without uppercase",
            "newpassword123",
            "New password must contain an uppercase letter"
        ], [
            "without lowercase",
            "NEWPASSWORD123",
            "New password must contain a lowercase letter"
        ]])(
            "rejects a new password %s", async (_, password, expectedMessage) => {
                const { errors } = await runValidation(changeCurrentUserPasswordValidator, {
                    body: {
                        currentPassword: "Password123",
                        newPassword: password
                    }
                });

                expect(getValidationMessages(errors)).toContain(expectedMessage);
            }
        );
    });
});
