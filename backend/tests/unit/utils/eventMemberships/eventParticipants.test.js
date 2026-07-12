const {
    findActiveMembership,
    findMembership
} = require("../../../../src/utils/eventMemberships/eventMembershipQueries");

/* ==========================================================================
   Event Membership Query Utility Unit Tests

   Tests reusable event membership database query helpers.

   Responsibilities
   - Test active membership lookup
   - Test membership lookup including inactive rows
   - Test transaction forwarding
   - Test query result passthrough

   Notes
   - The EventUserRole model is injected into the utility.
   - Active membership queries explicitly exclude soft-deleted rows.
=========================================================================== */

describe("event membership query utility", () => {
    const EventUserRole = {
        findOne: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       ACTIVE MEMBERSHIP LOOKUP
    ============================= */

    describe("findActiveMembership", () => {
        it("finds an active event membership", async () => {
            const membership = {
                eventId: 10,
                userId: 20,
                deletedAt: null
            };

            EventUserRole.findOne.mockResolvedValue(membership);

            const result = await findActiveMembership(
                EventUserRole,
                {
                    eventId: 10,
                    userId: 20
                }
            );

            expect(EventUserRole.findOne).toHaveBeenCalledWith({
                where: {
                    eventId: 10,
                    userId: 20,
                    deletedAt: null
                },
                transaction: undefined
            });

            expect(result).toBe(membership);
        });

        it("forwards the transaction option", async () => {
            const transaction = {
                id: "transaction"
            };

            EventUserRole.findOne.mockResolvedValue(null);

            const result = await findActiveMembership(
                EventUserRole,
                {
                    eventId: 10,
                    userId: 20,
                    transaction
                }
            );

            expect(EventUserRole.findOne).toHaveBeenCalledWith({
                where: {
                    eventId: 10,
                    userId: 20,
                    deletedAt: null
                },
                transaction
            });

            expect(result).toBeNull();
        });
    });

    /* =============================
       MEMBERSHIP LOOKUP
    ============================= */

    describe("findMembership", () => {
        it("finds a membership without filtering deletedAt", async () => {
            const membership = {
                eventId: 10,
                userId: 20,
                deletedAt: "2026-04-25T12:00:00.000Z"
            };

            EventUserRole.findOne.mockResolvedValue(membership);

            const result = await findMembership(
                EventUserRole,
                {
                    eventId: 10,
                    userId: 20
                }
            );

            expect(EventUserRole.findOne).toHaveBeenCalledWith({
                where: {
                    eventId: 10,
                    userId: 20
                },
                transaction: undefined
            });

            expect(result).toBe(membership);
        });

        it("forwards the transaction option", async () => {
            const transaction = {
                id: "transaction"
            };

            EventUserRole.findOne.mockResolvedValue(null);

            const result = await findMembership(
                EventUserRole,
                {
                    eventId: 10,
                    userId: 20,
                    transaction
                }
            );

            expect(EventUserRole.findOne).toHaveBeenCalledWith({
                where: {
                    eventId: 10,
                    userId: 20
                },
                transaction
            });

            expect(result).toBeNull();
        });
    });
});
