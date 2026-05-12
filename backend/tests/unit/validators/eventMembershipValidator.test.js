/* ==================================================
   EVENT MEMBERSHIP VALIDATOR TESTS

   Tests:
   - member role update validation
   - member removal validation
   - eventId param validation
   - userId param validation
   - role value validation

   Ensures:
   - invalid event role payloads are rejected early
   - route params are valid positive integers
   - roles are restricted to allowed values
   - shared event role constants are used for valid role scenarios
================================================== */

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const { updateEventMemberRoleValidator, removeEventMemberValidator, transferEventOwnershipValidator } = require("../../../src/validators/eventMembershipValidator");

const { runValidation } = require("../../helpers/validation/validationHelper");

describe("eventMembershipValidator", () => {

    /* =============================
       ROLE UPDATE VALIDATION
    ============================= */

    describe("updateEventMemberRoleValidator", () => {
        it("should pass with valid params and role", async () => {
            const result = await runValidation(
                updateEventMemberRoleValidator,
                {
                    params: {
                        eventId: "1",
                        userId: "2"
                    },
                    body: {
                        newRole: EVENT_ROLES.CO_ORGANIZER
                    }
                }
            );

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if eventId is not a positive integer", async () => {
            const result = await runValidation(
                updateEventMemberRoleValidator,
                {
                    params: {
                        eventId: "abc",
                        userId: "2"
                    },
                    body: {
                        newRole: EVENT_ROLES.PARTICIPANT
                    }
                }
            );

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "Event ID must be a positive integer" })
                ])
            );
        });

        it("should fail if userId is not a positive integer", async () => {
            const result = await runValidation(
                updateEventMemberRoleValidator,
                {
                    params: {
                        eventId: "1",
                        userId: "abc"
                    },
                    body: {
                        newRole: EVENT_ROLES.PARTICIPANT
                    }
                }
            );

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "User ID must be a positive integer" })
                ])
            );
        });

        it("should fail if newRole is missing", async () => {
            const result = await runValidation(
                updateEventMemberRoleValidator,
                {
                    params: {
                        eventId: "1",
                        userId: "2"
                    },
                    body: {
                        newRole: ""
                    }
                }
            );

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "newRole is required" })
                ])
            );
        });

        it("should fail if newRole is invalid", async () => {
            const result = await runValidation(
                updateEventMemberRoleValidator,
                {
                    params: {
                        eventId: "1",
                        userId: "2"
                    },
                    body: {
                        newRole: "admin"
                    }
                }
            );

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "newRole must be one of: organizer, co_organizer, participant" })
                ])
            );
        });
    });

    /* =============================
       MEMBER REMOVAL VALIDATION
    ============================= */

    describe("removeEventMemberValidator", () => {
        it("should pass with valid params", async () => {
            const result = await runValidation(
                removeEventMemberValidator,
                {
                    params: {
                        eventId: "1",
                        userId: "2"
                    }
                }
            );

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if eventId is not a positive integer", async () => {
            const result = await runValidation(
                removeEventMemberValidator,
                {
                    params: {
                        eventId: "abc",
                        userId: "2"
                    }
                }
            );

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "Event ID must be a positive integer" })
                ])
            );
        });

        it("should fail if userId is not a positive integer", async () => {
            const result = await runValidation(
                removeEventMemberValidator,
                {
                    params: {
                        eventId: "1",
                        userId: "abc"
                    }
                }
            );

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "User ID must be a positive integer" })
                ])
            );
        });
    });

    /* =============================
       OWNERSHIP TRANSFER VALIDATION
    ============================= */

    describe("transferEventOwnershipValidator", () => {
        it("should pass with valid eventId and targetUserId", async () => {
            const result = await runValidation(
                transferEventOwnershipValidator,
                {
                    params: {
                        eventId: "1"
                    },
                    body: {
                        targetUserId: "2"
                    }
                }
            );

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if eventId is not a positive integer", async () => {
            const result = await runValidation(
                transferEventOwnershipValidator,
                {
                    params: {
                        eventId: "abc"
                    },
                    body: {
                        targetUserId: "2"
                    }
                }
            );

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "Event ID must be a positive integer" })
                ])
            );
        });

        it("should fail if targetUserId is missing", async () => {
            const result = await runValidation(
                transferEventOwnershipValidator,
                {
                    params: {
                        eventId: "1"
                    },
                    body: {}
                }
            );

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "targetUserId is required" })
                ])
            );
        });

        it("should fail if targetUserId is not a positive integer", async () => {
            const result = await runValidation(
                transferEventOwnershipValidator,
                {
                    params: {
                        eventId: "1"
                    },
                    body: {
                        targetUserId: "abc"
                    }
                }
            );

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: "targetUserId must be a positive integer" })
                ])
            );
        });
    });
});
