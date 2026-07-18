const {
    eventIdParamValidator,
    updateEventMemberRoleValidator,
    removeEventMemberValidator,
    transferEventOwnershipValidator
} = require("../../../src/validators/eventMembershipValidator");

const {
    runValidation,
    getValidationMessages
} = require("../../helpers/validation/validationTestHelper");

/* ==========================================================================
   Event Membership Validator Unit Tests

   Tests event membership request validation.

   Responsibilities
   - Test event and user identifier validation
   - Test event member role updates
   - Test member removal parameters
   - Test event ownership transfer payloads
   - Test numeric identifier conversion

   Notes
   - Authorization is handled by dedicated middlewares.
   - Shared parameter validator behavior is covered separately.
=========================================================================== */

describe("event membership validator", () => {

    /* =============================
       EVENT ID EXPORT
    ============================= */

    describe("eventIdParamValidator", () => {
        it("re-exports the shared event ID validator", () => {
            expect(Array.isArray(eventIdParamValidator)).toBe(true);
            expect(eventIdParamValidator).toHaveLength(1);
        });
    });

    /* =============================
       MEMBER ROLE UPDATE
    ============================= */

    describe("updateEventMemberRoleValidator", () => {
        it.each([
            "organizer",
            "co_organizer",
            "participant"
        ])(
            "accepts the %s role", async (newRole) => {
                const { errors, req } = await runValidation(updateEventMemberRoleValidator, {
                    params: {
                        eventId: "10",
                        userId: "20"
                    },
                    body: {
                        newRole
                    }
                });

                expect(errors).toHaveLength(0);

                expect(req.params).toMatchObject({
                    eventId: 10,
                    userId: 20
                });
            });

        it("trims the new role", async () => {
            const { errors, req } = await runValidation(updateEventMemberRoleValidator, {
                params: {
                    eventId: "10",
                    userId: "20"
                },
                body: {
                    newRole: "  participant  "
                }
            });

            expect(errors).toHaveLength(0);
            expect(req.body.newRole).toBe("participant");
        });

        it.each([
            ["missing", undefined],
            ["empty", ""],
            ["whitespace-only", "   "]
        ])(
            "rejects a %s new role", async (_, newRole) => {
                const body = {};

                if (newRole !== undefined) {
                    body.newRole = newRole;
                }

                const { errors } = await runValidation(updateEventMemberRoleValidator, {
                    params: {
                        eventId: "10",
                        userId: "20"
                    },
                    body
                });

                expect(getValidationMessages(errors)).toContain("newRole is required");
            });

        it("rejects an unsupported new role", async () => {
            const { errors } = await runValidation(updateEventMemberRoleValidator, {
                params: {
                    eventId: "10",
                    userId: "20"
                },
                body: {
                    newRole: "moderator"
                }
            });

            expect(getValidationMessages(errors)).toContain("newRole must be one of: organizer, co_organizer, participant");
        });

        it.each([[
            "event ID",
            {
                eventId: "invalid",
                userId: "20"
            },
            "Event ID must be a positive integer"
        ], [
            "user ID",
            {
                eventId: "10",
                userId: "invalid"
            },
            "User ID must be a positive integer"
        ]])(
            "rejects an invalid %s", async (_, params, expectedMessage) => {
                const { errors } = await runValidation(updateEventMemberRoleValidator, {
                    params,
                    body: {
                        newRole: "participant"
                    }
                });

                expect(getValidationMessages(errors)).toContain(expectedMessage);
            }
        );
    });

    /* =============================
       MEMBER REMOVAL
    ============================= */

    describe("removeEventMemberValidator", () => {
        it("accepts and converts valid event and user IDs", async () => {
            const { errors, req } = await runValidation(removeEventMemberValidator, {
                params: {
                    eventId: "10",
                    userId: "20"
                }
            });

            expect(errors).toHaveLength(0);

            expect(req.params).toEqual({
                eventId: 10,
                userId: 20
            });
        });

        it.each([[
            "event ID",
            {
                eventId: "0",
                userId: "20"
            },
            "Event ID must be a positive integer"
        ], [
            "user ID",
            {
                eventId: "10",
                userId: "-1"
            },
            "User ID must be a positive integer"
        ]])(
            "rejects an invalid %s", async (_, params, expectedMessage) => {
                const { errors } = await runValidation(removeEventMemberValidator, { params });

                expect(getValidationMessages(errors)).toContain(expectedMessage);
            }
        );
    });

    /* =============================
       OWNERSHIP TRANSFER
    ============================= */

    describe("transferEventOwnershipValidator", () => {
        it("accepts and converts a valid ownership transfer payload", async () => {
            const { errors, req } = await runValidation(transferEventOwnershipValidator, {
                params: {
                    eventId: "10"
                },
                body: {
                    targetUserId: "20"
                }
            });

            expect(errors).toHaveLength(0);
            expect(req.params.eventId).toBe(10);
            expect(req.body.targetUserId).toBe(20);
        });

        it.each([
            ["missing", undefined],
            ["empty", ""]
        ])(
            "rejects a %s target user ID", async (_, targetUserId) => {
                const body = {};

                if (targetUserId !== undefined) {
                    body.targetUserId = targetUserId;
                }

                const { errors } = await runValidation(transferEventOwnershipValidator, {
                    params: {
                        eventId: "10"
                    },
                    body
                });

                expect(getValidationMessages(errors)).toContain("targetUserId is required");
            });

        it.each([
            ["zero", "0"],
            ["negative", "-1"],
            ["non-numeric", "abc"]
        ])(
            "rejects a %s target user ID", async (_, targetUserId) => {
                const { errors } = await runValidation(transferEventOwnershipValidator, {
                    params: {
                        eventId: "10"
                    },
                    body: {
                        targetUserId
                    }
                });

                expect(getValidationMessages(errors)).toContain("targetUserId must be a positive integer");
            });

        it("rejects an invalid event ID", async () => {
            const { errors } = await runValidation(transferEventOwnershipValidator, {
                params: {
                    eventId: "invalid"
                },
                body: {
                    targetUserId: "20"
                }
            });

            expect(getValidationMessages(errors)).toContain("Event ID must be a positive integer");
        });
    });
});
