const { findEventByIdOrFail } = require("../../../../src/utils/events/eventQueries");

/* ==========================================================================
   Event Query Utility Unit Tests

   Tests reusable event database query helpers.

   Responsibilities
   - Test event lookup by ID
   - Test Sequelize option forwarding
   - Test event result passthrough
   - Test event not found errors

   Notes
   - The Event model is injected into the utility.
   - Entity existence errors use the shared HTTP error format.
=========================================================================== */

describe("event query utility", () => {
    const Event = {
        findByPk: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       EVENT LOOKUP SUCCESS
    ============================= */

    describe("findEventByIdOrFail success", () => {
        it("finds an event by ID", async () => {
            const event = {
                id: 10,
                title: "Community Meetup"
            };

            Event.findByPk.mockResolvedValue(event);

            const result = await findEventByIdOrFail(
                Event,
                10
            );

            expect(Event.findByPk).toHaveBeenCalledWith(
                10,
                {}
            );

            expect(result).toBe(event);
        });

        it("forwards Sequelize query options", async () => {
            const event = {
                id: 10
            };

            const options = {
                transaction: {
                    id: "transaction"
                },
                include: [
                    {
                        association: "creator"
                    }
                ]
            };

            Event.findByPk.mockResolvedValue(event);

            const result = await findEventByIdOrFail(
                Event,
                10,
                options
            );

            expect(Event.findByPk).toHaveBeenCalledWith(
                10,
                options
            );

            expect(result).toBe(event);
        });
    });

    /* =============================
       EVENT NOT FOUND
    ============================= */

    describe("findEventByIdOrFail failure", () => {
        it("throws a 404 error when the event does not exist", async () => {
            Event.findByPk.mockResolvedValue(null);

            await expect(findEventByIdOrFail(Event, 999)).rejects.toMatchObject({
                message: "Event not found",
                statusCode: 404
            });
        });

        it("queries the requested event before throwing", async () => {
            Event.findByPk.mockResolvedValue(null);

            await expect(findEventByIdOrFail(
                Event,
                999,
                {
                    transaction: {
                        id: "transaction"
                    }
                }
            )).rejects.toThrow("Event not found");

            expect(Event.findByPk).toHaveBeenCalledWith(
                999,
                {
                    transaction: {
                        id: "transaction"
                    }
                }
            );
        });
    });
});
