
const { validationResult } = require("express-validator");

const { updateMemberRoleValidator, removeMemberValidator } = require("../../src/validators/eventRoleValidator");

/**
 * Event Role Validator
 *
 * Verifies validation rules for event member role actions:
 * role update and member removal.
 *
 * Ensures route params and role values are valid before reaching controllers.
*/

// Helper to simulate Express request validation
const runValidation = async (validators, { params = {}, body = {} } = {}) => {
    const req = { params, body };

    for (const validator of validators) {
        await validator.run(req);
    }

    return validationResult(req);
};

describe("eventRoleValidator", () => {
    describe("updateMemberRoleValidator", () => {
        it("should pass with valid params and role", async () => {
            const result = await runValidation(updateMemberRoleValidator, {
                params: {
                    eventId: "1",
                    userId: "2"
                },
                body: {
                    newRole: "co_organizer"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if eventId is not a positive integer", async () => {
            const result = await runValidation(updateMemberRoleValidator, {
                params: {
                    eventId: "abc",
                    userId: "2"
                },
                body: {
                    newRole: "participant"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Event ID must be a positive integer"
                    })
                ])
            );
        });

        it("should fail if userId is not a positive integer", async () => {
            const result = await runValidation(updateMemberRoleValidator, {
                params: {
                    eventId: "1",
                    userId: "abc"
                },
                body: {
                    newRole: "participant"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "User ID must be a positive integer"
                    })
                ])
            );
        });

        it("should fail if newRole is missing", async () => {
            const result = await runValidation(updateMemberRoleValidator, {
                params: {
                    eventId: "1",
                    userId: "2"
                },
                body: {
                    newRole: ""
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "newRole is required"
                    })
                ])
            );
        });

        it("should fail if newRole is invalid", async () => {
            const result = await runValidation(updateMemberRoleValidator, {
                params: {
                    eventId: "1",
                    userId: "2"
                },
                body: {
                    newRole: "admin"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "newRole must be one of: organizer, co_organizer, participant"
                    })
                ])
            );
        });
    });

    describe("removeMemberValidator", () => {
        it("should pass with valid params", async () => {
            const result = await runValidation(removeMemberValidator, {
                params: {
                    eventId: "1",
                    userId: "2"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail if eventId is not a positive integer", async () => {
            const result = await runValidation(removeMemberValidator, {
                params: {
                    eventId: "abc",
                    userId: "2"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Event ID must be a positive integer"
                    })
                ])
            );
        });

        it("should fail if userId is not a positive integer", async () => {
            const result = await runValidation(removeMemberValidator, {
                params: {
                    eventId: "1",
                    userId: "abc"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "User ID must be a positive integer"
                    })
                ])
            );
        });
    });
});