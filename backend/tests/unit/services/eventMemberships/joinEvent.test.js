const mockFindEventByIdOrFail = jest.fn();
const mockAssertEventNotPast = jest.fn();

const mockFindActiveMembership = jest.fn();
const mockFindMembership = jest.fn();
const mockCountActiveParticipants = jest.fn();

jest.mock("../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../src/models/eventModel", () => ({
    name: "Event"
}));

jest.mock("../../../../src/models/userModel", () => ({
    name: "User"
}));

jest.mock("../../../../src/models/associations/eventUserRoleModel", () => ({
    create: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventQueries", () => ({
    findEventByIdOrFail: mockFindEventByIdOrFail
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    assertEventNotPast: mockAssertEventNotPast
}));

jest.mock("../../../../src/utils/eventMemberships/eventMembershipQueries", () => ({
    findActiveMembership: mockFindActiveMembership,
    findMembership: mockFindMembership
}));

jest.mock("../../../../src/utils/eventMemberships/eventParticipants", () => ({
    countActiveParticipants:
        mockCountActiveParticipants
}));

jest.mock("../../../../src/utils/users/userInclude", () => ({
    buildPublicUserInclude: jest.fn()
}));

const sequelize = require("../../../../src/config/database");

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/associations/eventUserRoleModel");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

const { joinEvent } = require("../../../../src/services/eventMembershipService");

const { createTransactionMock } = require("../../../helpers/database/modelTestHelper");

const { mockSystemTime } = require("../../../helpers/mocks/systemTimeTestHelper");

const {
    createMockMembershipEvent,
    createMockMembership
} = require("../../../factories/eventMembershipFactory");

/* ==========================================================================
   Join Event Service Unit Tests

   Tests event membership creation and restoration.

   Responsibilities
   - Test event existence and lifecycle validation
   - Test registration deadline enforcement
   - Test participant capacity enforcement
   - Test duplicate active membership protection
   - Test inactive membership restoration
   - Test participant membership creation
   - Test transaction commit and rollback
   - Test unexpected error propagation

   Notes
   - Event and membership query utilities are mocked.
   - System time is fixed for deterministic registration deadline checks.
=========================================================================== */

describe("join event service", () => {
    mockSystemTime("2026-04-25T12:00:00.000Z");

    let transaction;

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = createTransactionMock();

        sequelize.transaction.mockResolvedValue(transaction);

        mockFindEventByIdOrFail.mockResolvedValue(
            createMockMembershipEvent({
                id: 1,
                maxParticipants: 5,
                registrationDeadline: "2026-04-25T13:00:00.000Z"
            })
        );

        mockAssertEventNotPast.mockImplementation(() => { });

        mockCountActiveParticipants.mockResolvedValue(2);

        mockFindMembership.mockResolvedValue(null);

        EventUserRole.create.mockResolvedValue(
            createMockMembership({
                eventId: 1,
                userId: 10,
                role: EVENT_ROLES.PARTICIPANT,
                deletedAt: null
            })
        );
    });

    /* =============================
       MEMBERSHIP CREATION
    ============================= */

    describe("Membership creation", () => {
        it("creates a participant membership inside a transaction", async () => {
            const result = await joinEvent({
                eventId: 1,
                userId: 10
            });

            expect(sequelize.transaction).toHaveBeenCalledTimes(1);

            expect(mockFindEventByIdOrFail).toHaveBeenCalledWith(
                Event,
                1,
                {
                    transaction
                }
            );

            expect(mockAssertEventNotPast).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1
                })
            );

            expect(mockCountActiveParticipants).toHaveBeenCalledWith(
                EventUserRole,
                {
                    eventId: 1,
                    transaction
                }
            );

            expect(mockFindMembership).toHaveBeenCalledWith(
                EventUserRole,
                {
                    eventId: 1,
                    userId: 10,
                    transaction
                }
            );

            expect(EventUserRole.create).toHaveBeenCalledWith({
                eventId: 1,
                userId: 10,
                role: EVENT_ROLES.PARTICIPANT
            }, {
                transaction
            });

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).not.toHaveBeenCalled();

            expect(result).toEqual(
                expect.objectContaining({
                    eventId: 1,
                    userId: 10,
                    role: EVENT_ROLES.PARTICIPANT
                })
            );
        });

        it("does not count participants for an unlimited event", async () => {
            mockFindEventByIdOrFail.mockResolvedValue(
                createMockMembershipEvent({
                    id: 1,
                    maxParticipants: null,
                    registrationDeadline: null
                })
            );

            await joinEvent({
                eventId: 1,
                userId: 10
            });

            expect(mockCountActiveParticipants).not.toHaveBeenCalled();

            expect(EventUserRole.create).toHaveBeenCalledTimes(1);

            expect(transaction.commit).toHaveBeenCalledTimes(1);
        });
    });

    /* =============================
       MEMBERSHIP RESTORATION
    ============================= */

    describe("Membership restoration", () => {
        it("restores an inactive membership as a participant", async () => {
            const inactiveMembership = createMockMembership({
                eventId: 1,
                userId: 10,
                role: EVENT_ROLES.CO_ORGANIZER,
                deletedAt: new Date(
                    "2026-01-01T00:00:00.000Z"
                ),
                save: jest.fn().mockResolvedValue()
            });

            mockFindMembership.mockResolvedValue(inactiveMembership);

            const result = await joinEvent({
                eventId: 1,
                userId: 10
            });

            expect(inactiveMembership.deletedAt).toBeNull();

            expect(inactiveMembership.role).toBe(EVENT_ROLES.PARTICIPANT);

            expect(inactiveMembership.save).toHaveBeenCalledWith({
                transaction
            });

            expect(EventUserRole.create).not.toHaveBeenCalled();

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).not.toHaveBeenCalled();

            expect(result).toBe(inactiveMembership);
        });
    });

    /* =============================
       EVENT VALIDATION
    ============================= */

    describe("Event validation", () => {
        it("rolls back when the event does not exist", async () => {
            const error = Object.assign(
                new Error("Event not found"),
                {
                    statusCode: 404
                }
            );

            mockFindEventByIdOrFail.mockRejectedValue(error);

            await expect(
                joinEvent({
                    eventId: 999,
                    userId: 10
                })
            ).rejects.toBe(error);

            expect(mockAssertEventNotPast).not.toHaveBeenCalled();

            expect(mockFindMembership).not.toHaveBeenCalled();

            expect(EventUserRole.create).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });

        it("rolls back when the event is past", async () => {
            const error = Object.assign(
                new Error("No action is allowed on a past event"),
                {
                    statusCode: 403
                }
            );

            mockAssertEventNotPast.mockImplementation(() => {
                throw error;
            });

            await expect(
                joinEvent({
                    eventId: 1,
                    userId: 10
                })
            ).rejects.toBe(error);

            expect(mockCountActiveParticipants).not.toHaveBeenCalled();

            expect(mockFindMembership).not.toHaveBeenCalled();

            expect(EventUserRole.create).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });
    });

    /* =============================
       REGISTRATION DEADLINE
    ============================= */

    describe("Registration deadline", () => {
        it("throws a 409 error when registration is closed", async () => {
            mockFindEventByIdOrFail.mockResolvedValue(
                createMockMembershipEvent({
                    id: 1,
                    maxParticipants: null,
                    registrationDeadline: "2026-04-25T11:59:00.000Z"
                })
            );

            await expect(
                joinEvent({
                    eventId: 1,
                    userId: 10
                })
            ).rejects.toMatchObject({
                message: "Registration period is over for this event",
                statusCode: 409
            });

            expect(mockCountActiveParticipants).not.toHaveBeenCalled();

            expect(mockFindMembership).not.toHaveBeenCalled();

            expect(EventUserRole.create).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });

        it("allows registration exactly at the deadline", async () => {
            mockFindEventByIdOrFail.mockResolvedValue(
                createMockMembershipEvent({
                    id: 1,
                    maxParticipants: null,
                    registrationDeadline: "2026-04-25T12:00:00.000Z"
                })
            );

            await joinEvent({
                eventId: 1,
                userId: 10
            });

            expect(EventUserRole.create).toHaveBeenCalledTimes(1);

            expect(transaction.commit).toHaveBeenCalledTimes(1);
        });
    });

    /* =============================
       PARTICIPANT CAPACITY
    ============================= */

    describe("Participant capacity", () => {
        it("throws a 409 error when the event is full", async () => {
            mockFindEventByIdOrFail.mockResolvedValue(
                createMockMembershipEvent({
                    id: 1,
                    maxParticipants: 2,
                    registrationDeadline: null
                })
            );

            mockCountActiveParticipants.mockResolvedValue(2);

            await expect(
                joinEvent({
                    eventId: 1,
                    userId: 10
                })
            ).rejects.toMatchObject({
                message: "Event has reached maximum number of participants",
                statusCode: 409
            });

            expect(mockFindMembership).not.toHaveBeenCalled();

            expect(EventUserRole.create).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });
    });

    /* =============================
       DUPLICATE MEMBERSHIP
    ============================= */

    describe("Duplicate membership", () => {
        it("throws a 409 error when an active membership already exists", async () => {
            mockFindMembership.mockResolvedValue(
                createMockMembership({
                    eventId: 1,
                    userId: 10,
                    role: EVENT_ROLES.PARTICIPANT,
                    deletedAt: null
                })
            );

            await expect(
                joinEvent({
                    eventId: 1,
                    userId: 10
                })
            ).rejects.toMatchObject({
                message: "User already joined this event",
                statusCode: 409
            });

            expect(EventUserRole.create).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it.each([[
            "participant count", () => {
                mockCountActiveParticipants.mockRejectedValue(
                    new Error("Participant count failed")
                );
            }
        ], ["membership lookup", () => {
            mockFindMembership.mockRejectedValue(
                new Error("Membership lookup failed")
            );
        }
        ], ["membership creation", () => {
            EventUserRole.create.mockRejectedValue(
                new Error("Membership creation failed")
            );
        }
        ]])("rolls back and propagates %s errors",
            async (_, configureError) => {
                configureError();

                await expect(
                    joinEvent({
                        eventId: 1,
                        userId: 10
                    })
                ).rejects.toBeInstanceOf(Error);

                expect(transaction.commit).not.toHaveBeenCalled();

                expect(transaction.rollback).toHaveBeenCalledTimes(1);
            }
        );

        it("rolls back when inactive membership restoration fails", async () => {
            const error = new Error("Membership restoration failed");

            const inactiveMembership = createMockMembership({
                eventId: 1,
                userId: 10,
                role: EVENT_ROLES.CO_ORGANIZER,
                deletedAt: new Date(
                    "2026-01-01T00:00:00.000Z"
                ),
                save: jest.fn().mockRejectedValue(error)
            });

            mockFindMembership.mockResolvedValue(inactiveMembership);

            await expect(
                joinEvent({
                    eventId: 1,
                    userId: 10
                })
            ).rejects.toBe(error);

            expect(EventUserRole.create).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });
    });
});
