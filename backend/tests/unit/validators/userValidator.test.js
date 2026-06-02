/* ==================================================
   USER VALIDATOR TESTS

   Tests:
   - current user events query validation
   - status and mode allowlists
   - current user profile update validation
   - current user password update validation
   - public user events query validation
   - public user ID param validation

   Ensures:
   - current user query params are validated before service logic
   - current user payloads are validated before controller logic
   - current user password policy is enforced
   - public user event query params are validated before service logic
   - public user routes only receive valid positive integer IDs
   - invalid route params are rejected before service lookup
================================================== */

const {
    getCurrentUserEventsValidator,
    updateCurrentUserProfileValidator,
    changeCurrentUserPasswordValidator,
    getPublicUserEventsValidator,
    userIdParamValidator
} = require("../../../src/validators/userValidator");

const { PASSWORD_MIN_LENGTH } = require("../../../src/config/security/passwordPolicy");

const { EVENT_STATUS } = require("../../../src/constants/eventStatus");
const { EVENT_MODES } = require("../../../src/constants/eventModes");

const { runValidation } = require("../../helpers/validation/validationHelper");

describe("userValidator", () => {

    /* =============================
       CURRENT USER EVENTS QUERY VALIDATION
    ============================= */

    describe("getCurrentUserEventsValidator", () => {
        it("should pass with valid query params", async () => {
            const result = await runValidation(getCurrentUserEventsValidator, {
                query: {
                    view: "created",
                    status: EVENT_STATUS.UPCOMING,
                    mode: EVENT_MODES.ONLINE,
                    page: "1",
                    pageSize: "10",
                    sortBy: "startDateTime",
                    order: "asc"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should allow ongoing status", async () => {
            const result = await runValidation(
                getCurrentUserEventsValidator,
                {
                    query: {
                        status: EVENT_STATUS.ONGOING
                    }
                }
            );

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail with invalid view", async () => {
            const result = await runValidation(getCurrentUserEventsValidator, {
                query: {
                    view: "invalid"
                }
            });

            expect(result.array()[0].msg).toMatch(/view must be one of/i);
        });

        it("should fail with invalid date", async () => {
            const result = await runValidation(getCurrentUserEventsValidator, {
                query: {
                    date: "not-a-date"
                }
            });

            expect(result.array()[0].msg).toMatch(/date must be a valid iso8601 date/i);
        });

        it("should fail with invalid sortBy", async () => {
            const result = await runValidation(getCurrentUserEventsValidator, {
                query: {
                    sortBy: "creatorId"
                }
            });

            expect(result.array()[0].msg).toMatch(/sort field must be one of/i);
        });

        it("should fail with invalid status", async () => {
            const result = await runValidation(
                getCurrentUserEventsValidator,
                {
                    query: {
                        status: "cancelled"
                    }
                }
            );

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Status must be upcoming, ongoing or past"
                    })
                ])
            );
        });

        it("should fail with invalid mode", async () => {
            const result = await runValidation(
                getCurrentUserEventsValidator,
                {
                    query: {
                        mode: "hybrid"
                    }
                }
            );

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Mode must be online or in_person"
                    })
                ])
            );
        });
    });

    /* =============================
       CURRENT USER PROFILE UPDATE VALIDATION
    ============================= */

    describe("updateCurrentUserProfileValidator", () => {
        it("should pass with valid optional fields", async () => {
            const result = await runValidation(updateCurrentUserProfileValidator, {
                body: {
                    name: "John",
                    email: "john@test.com"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if name is too short", async () => {
            const result = await runValidation(updateCurrentUserProfileValidator, {
                body: {
                    name: "A"
                }
            });

            expect(result.array()[0].msg).toMatch(/at least 2 characters/i);
        });

        it("should fail if email is invalid", async () => {
            const result = await runValidation(updateCurrentUserProfileValidator, {
                body: {
                    email: "bad-email"
                }
            });

            expect(result.array()[0].msg).toMatch(/invalid email/i);
        });
    });

    /* =============================
       CURRENT USER PASSWORD UPDATE VALIDATION
    ============================= */

    describe("changeCurrentUserPasswordValidator", () => {
        it("should pass with valid data", async () => {
            const result = await runValidation(changeCurrentUserPasswordValidator, {
                body: {
                    currentPassword: "oldPass1",
                    newPassword: "NewPass1"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if currentPassword is missing", async () => {
            const result = await runValidation(changeCurrentUserPasswordValidator, {
                body: {
                    newPassword: "NewPass1"
                }
            });

            expect(result.array()[0].msg).toMatch(/current password is required/i);
        });

        it("should fail if newPassword is missing", async () => {
            const result = await runValidation(changeCurrentUserPasswordValidator, {
                body: {
                    currentPassword: "oldPass1"
                }
            });

            expect(result.array()[0].msg).toMatch(/new password is required/i);
        });

        it("should fail if newPassword is shorter than password policy minimum", async () => {
            const result = await runValidation(changeCurrentUserPasswordValidator, {
                body: {
                    currentPassword: "oldPass1",
                    newPassword: `Aa1${"x".repeat(PASSWORD_MIN_LENGTH - 4)}`
                }
            });

            expect(result.isEmpty()).toBe(false);
        });

        it("should fail if newPassword is weak", async () => {
            const result = await runValidation(changeCurrentUserPasswordValidator, {
                body: {
                    currentPassword: "oldPass1",
                    newPassword: "abc"
                }
            });

            expect(result.isEmpty()).toBe(false);
        });
    });

    /* =============================
       PUBLIC USER EVENTS QUERY VALIDATION
    ============================= */

    describe("getPublicUserEventsValidator", () => {

        it("should pass with valid query params", async () => {
            const result = await runValidation(
                getPublicUserEventsValidator,
                {
                    query: {
                        view: "created",
                        status: EVENT_STATUS.UPCOMING,
                        mode: EVENT_MODES.ONLINE,
                        page: "1",
                        pageSize: "10",
                        sortBy: "startDateTime",
                        order: "asc"
                    }
                }
            );

            expect(result.isEmpty()).toBe(true);
        });

        it("should allow joined view", async () => {
            const result = await runValidation(
                getPublicUserEventsValidator,
                {
                    query: {
                        view: "joined"
                    }
                }
            );

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail with invalid view", async () => {
            const result = await runValidation(
                getPublicUserEventsValidator,
                {
                    query: {
                        view: "invalid"
                    }
                }
            );

            expect(result.array()[0].msg).toMatch(/view must be one of/i);
        });

        it("should fail with invalid status", async () => {
            const result = await runValidation(
                getPublicUserEventsValidator,
                {
                    query: {
                        status: "cancelled"
                    }
                }
            );

            expect(result.array()[0].msg).toMatch(/status must be upcoming/i);
        });

        it("should fail with invalid page", async () => {
            const result = await runValidation(
                getPublicUserEventsValidator,
                {
                    query: {
                        page: "0"
                    }
                }
            );

            expect(result.array()[0].msg).toMatch(/page must be a positive integer/i);
        });

        it("should fail with invalid pageSize", async () => {
            const result = await runValidation(
                getPublicUserEventsValidator,
                {
                    query: {
                        pageSize: "500"
                    }
                }
            );

            expect(result.array()[0].msg).toMatch(/page size must be between 1 and 100/i);
        });

        it("should fail with invalid sortBy", async () => {
            const result = await runValidation(
                getPublicUserEventsValidator,
                {
                    query: {
                        sortBy: "creatorId"
                    }
                }
            );

            expect(result.array()[0].msg).toMatch(/sort field must be one of/i);
        });

        it("should fail with invalid order", async () => {
            const result = await runValidation(
                getPublicUserEventsValidator,
                {
                    query: {
                        order: "invalid"
                    }
                }
            );

            expect(result.array()[0].msg).toMatch(/order must be asc or desc/i);
        });
    });

    /* =============================
       PUBLIC USER ID PARAM VALIDATION
    ============================= */

    describe("userIdParamValidator", () => {
        it("should pass with valid user ID", async () => {
            const result = await runValidation(userIdParamValidator, {
                params: {
                    id: "5"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail with non-integer ID", async () => {
            const result = await runValidation(userIdParamValidator, {
                params: {
                    id: "abc"
                }
            });

            expect(result.array()[0].msg).toMatch(/user id must be a positive integer/i);
        });

        it("should fail with negative ID", async () => {
            const result = await runValidation(userIdParamValidator, {
                params: {
                    id: "-3"
                }
            });

            expect(result.array()[0].msg).toMatch(/user id must be a positive integer/i);
        });

        it("should fail with float ID", async () => {
            const result = await runValidation(userIdParamValidator, {
                params: {
                    id: "1.5"
                }
            });

            expect(result.array()[0].msg).toMatch(/user id must be a positive integer/i);
        });

        it("should fail with zero as ID", async () => {
            const result = await runValidation(userIdParamValidator, {
                params: {
                    id: "0"
                }
            });

            expect(result.array()[0].msg).toMatch(/user id must be a positive integer/i);
        });
    });
});
