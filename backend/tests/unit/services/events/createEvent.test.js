const mockResolveEventLocation = jest.fn();
const mockNormalizeString = jest.fn();
const mockBuildCreateEventPayload = jest.fn();

jest.mock("../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../src/models/eventModel", () => ({
    create: jest.fn()
}));

jest.mock("../../../../src/models/userModel", () => ({
    name: "User"
}));

jest.mock("../../../../src/models/associations/eventUserRoleModel", () => ({
    create: jest.fn()
}));

jest.mock("../../../../src/models/associations/eventReviewModel", () => ({
    name: "EventReview"
}));

jest.mock("../../../../src/models/associations/eventLikeModel", () => ({
    name: "EventLike"
}));

jest.mock("../../../../src/services/geocodingService", () => ({
    resolveEventLocation: mockResolveEventLocation
}));

jest.mock("../../../../src/utils/stringNormalizer", () => ({
    normalizeString: mockNormalizeString
}));

jest.mock("../../../../src/utils/events/eventPayloadBuilder", () => ({
    buildCreateEventPayload: mockBuildCreateEventPayload,
    buildUpdateEventPayload: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventFilters", () => ({
    buildEventWhereConditions: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventCreatorInclude", () => ({
    buildEventCreatorInclude: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventQueries", () => ({
    findEventByIdOrFail: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    assertEventNotPast: jest.fn(),
    assertEventNotStarted: jest.fn(),
    hasEventStarted: jest.fn(),
    getEventStatus: jest.fn()
}));

jest.mock("../../../../src/utils/eventMemberships/eventMembershipQueries", () => ({
    findActiveMembership: jest.fn()
}));

jest.mock("../../../../src/utils/eventMemberships/eventParticipants", () => ({
    buildActiveParticipantInclude: jest.fn(),
    buildEventParticipantCountAttribute: jest.fn()
}));

jest.mock("../../../../src/utils/eventReviews/eventReviews", () => ({
    buildEventReviewInclude: jest.fn(),
    buildEventReviewCountAttribute: jest.fn(),
    buildEventAverageRatingAttribute: jest.fn()
}));

jest.mock("../../../../src/utils/eventLikes/eventLikes", () => ({
    buildEventLikeInclude: jest.fn(),
    buildEventLikeCountAttribute: jest.fn(),
    findLikedEventIdsByUser: jest.fn(),
    findEventLike: jest.fn()
}));

jest.mock("../../../../src/utils/files/uploadedFileStorage", () => ({
    deleteUploadedFile: jest.fn()
}));

jest.mock("../../../../src/utils/pagination", () => ({
    getPaginationOptions: jest.fn(),
    getTotalCount: jest.fn(),
    getTotalPages: jest.fn()
}));

const sequelize = require("../../../../src/config/database");

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/associations/eventUserRoleModel");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");
const { EVENT_MODES } = require("../../../../src/constants/eventModes");

const { createEvent } = require("../../../../src/services/eventService");

const { createTransactionMock } = require("../../../helpers/database/modelTestHelper");

const { createEventPayload } = require("../../../factories/eventFactory");

/* ==========================================================================
   Create Event Service Unit Tests

   Tests event creation business logic.

   Responsibilities
   - Test event date validation
   - Test in-person event geocoding
   - Test online event geocoding bypass
   - Test event payload construction
   - Test event persistence
   - Test organizer membership creation
   - Test transaction commit and rollback
   - Test unexpected error propagation

   Notes
   - Validation, geocoding and payload construction run before the transaction.
   - The event creator is automatically assigned the organizer role.
=========================================================================== */

describe("create event service", () => {
    let transaction;
    let eventInput;
    let locationData;
    let eventData;
    let createdEvent;

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = createTransactionMock();

        eventInput = createEventPayload({
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z",
            image: null
        });

        locationData = {
            latitude: 45.5031824,
            longitude: -73.5698065,
            label: "Montréal, Québec, Canada",
            streetAddress: "1500 Rue Sainte-Catherine O",
            city: "Montréal",
            region: "Québec",
            postalCode: "H3G 1S8",
            country: "Canada"
        };

        eventData = {
            ...eventInput,
            creatorId: 10,
            locationLabel: locationData.label,
            streetAddress: locationData.streetAddress,
            city: locationData.city,
            region: locationData.region,
            postalCode: locationData.postalCode,
            country: locationData.country,
            latitude: locationData.latitude,
            longitude: locationData.longitude
        };

        createdEvent = {
            id: 1,
            creatorId: 10,
            title: eventInput.title
        };

        mockNormalizeString.mockImplementation(
            (value) => String(value ?? "").trim()
        );

        mockResolveEventLocation.mockResolvedValue(locationData);

        mockBuildCreateEventPayload.mockReturnValue(eventData);

        sequelize.transaction.mockResolvedValue(transaction);

        Event.create.mockResolvedValue(createdEvent);

        EventUserRole.create.mockResolvedValue({
            id: 1,
            eventId: 1,
            userId: 10,
            role: EVENT_ROLES.ORGANIZER
        });
    });

    /* =============================
       EVENT CREATION
    ============================= */

    describe("createEvent", () => {
        it("creates an in-person event and organizer membership", async () => {
            const result = await createEvent(
                eventInput,
                10
            );

            expect(mockNormalizeString).toHaveBeenCalledWith(
                "Montreal"
            );

            expect(mockResolveEventLocation).toHaveBeenCalledTimes(1);

            expect(mockResolveEventLocation).toHaveBeenCalledWith(
                "Montreal"
            );

            expect(mockBuildCreateEventPayload).toHaveBeenCalledTimes(1);

            expect(mockBuildCreateEventPayload).toHaveBeenCalledWith(
                eventInput,
                10,
                locationData
            );

            expect(sequelize.transaction).toHaveBeenCalledTimes(1);

            expect(Event.create).toHaveBeenCalledTimes(1);

            expect(Event.create).toHaveBeenCalledWith(
                eventData,
                {
                    transaction
                }
            );

            expect(EventUserRole.create).toHaveBeenCalledTimes(1);

            expect(EventUserRole.create).toHaveBeenCalledWith({
                eventId: 1,
                userId: 10,
                role:
                    EVENT_ROLES.ORGANIZER
            }, {
                transaction
            });

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).not.toHaveBeenCalled();

            expect(result).toBe(createdEvent);
        });

        it("creates an online event without resolving location data", async () => {
            const onlineInput = createEventPayload({
                mode: EVENT_MODES.ONLINE,
                location: undefined,
                startDateTime: "2026-12-20T10:00:00.000Z",
                endDateTime: "2026-12-20T12:00:00.000Z"
            });

            const onlineEventData = {
                ...onlineInput,
                creatorId: 10,
                location: null,
                locationLabel: null,
                streetAddress: null,
                city: null,
                region: null,
                postalCode: null,
                country: null,
                latitude: null,
                longitude: null
            };

            const onlineEvent = {
                id: 2,
                creatorId: 10,
                title: onlineInput.title,
                mode: EVENT_MODES.ONLINE
            };

            mockBuildCreateEventPayload.mockReturnValue(onlineEventData);

            Event.create.mockResolvedValue(onlineEvent);

            const result = await createEvent(
                onlineInput,
                10
            );

            expect(mockResolveEventLocation).not.toHaveBeenCalled();

            expect(mockBuildCreateEventPayload).toHaveBeenCalledWith(
                onlineInput,
                10,
                null
            );

            expect(Event.create).toHaveBeenCalledWith(
                onlineEventData,
                {
                    transaction
                }
            );

            expect(EventUserRole.create).toHaveBeenCalledWith({
                eventId: 2,
                userId: 10,
                role:
                    EVENT_ROLES.ORGANIZER
            }, {
                transaction
            });

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).not.toHaveBeenCalled();

            expect(result).toBe(onlineEvent);
        });

        it("does not resolve location data when the location is blank", async () => {
            const input = createEventPayload({
                mode: EVENT_MODES.IN_PERSON,
                location: "   ",
                startDateTime: "2026-12-20T10:00:00.000Z",
                endDateTime: "2026-12-20T12:00:00.000Z"
            });

            mockBuildCreateEventPayload.mockReturnValue({
                ...input,
                creatorId: 10
            });

            await createEvent(input, 10);

            expect(mockNormalizeString).toHaveBeenCalledWith("   ");

            expect(mockResolveEventLocation).not.toHaveBeenCalled();

            expect(mockBuildCreateEventPayload).toHaveBeenCalledWith(
                input,
                10,
                null
            );
        });
    });

    /* =============================
       DATE VALIDATION
    ============================= */

    describe("Date validation", () => {
        it.each([[
            "before the start date",
            "2026-12-20T12:00:00.000Z",
            "2026-12-20T10:00:00.000Z"
        ], [
            "equal to the start date",
            "2026-12-20T10:00:00.000Z",
            "2026-12-20T10:00:00.000Z"
        ]])("throws a 400 error when the end date is %s",
            async (
                _,
                startDateTime,
                endDateTime
            ) => {
                await expect(
                    createEvent(
                        {
                            ...eventInput,
                            startDateTime,
                            endDateTime
                        },
                        10
                    )
                ).rejects.toMatchObject({
                    message: "End date must be after start date",
                    statusCode: 400
                });

                expect(mockNormalizeString).not.toHaveBeenCalled();

                expect(mockResolveEventLocation).not.toHaveBeenCalled();

                expect(mockBuildCreateEventPayload).not.toHaveBeenCalled();

                // Validation happens before opening a transaction.
                expect(sequelize.transaction).not.toHaveBeenCalled();

                expect(Event.create).not.toHaveBeenCalled();
                expect(EventUserRole.create).not.toHaveBeenCalled();

                expect(transaction.rollback).not.toHaveBeenCalled();
            }
        );
    });

    /* =============================
       PRE-TRANSACTION ERRORS
    ============================= */

    describe("Pre-transaction errors", () => {
        it("propagates geocoding errors without opening a transaction", async () => {
            const error = new Error("Geocoding failed");

            mockResolveEventLocation.mockRejectedValue(error);

            await expect(createEvent(eventInput, 10)).rejects.toBe(error);

            expect(mockBuildCreateEventPayload).not.toHaveBeenCalled();

            expect(sequelize.transaction).not.toHaveBeenCalled();

            expect(Event.create).not.toHaveBeenCalled();
            expect(EventUserRole.create).not.toHaveBeenCalled();

            expect(transaction.rollback).not.toHaveBeenCalled();
        });

        it("propagates payload construction errors without opening a transaction", async () => {
            const error = new Error("Payload construction failed");

            mockBuildCreateEventPayload.mockImplementation(() => {
                throw error;
            });

            await expect(createEvent(eventInput, 10)).rejects.toBe(error);

            expect(mockResolveEventLocation).toHaveBeenCalledTimes(1);

            expect(sequelize.transaction).not.toHaveBeenCalled();

            expect(Event.create).not.toHaveBeenCalled();
            expect(EventUserRole.create).not.toHaveBeenCalled();

            expect(transaction.rollback).not.toHaveBeenCalled();
        });
    });

    /* =============================
       TRANSACTION ERRORS
    ============================= */

    describe("Transaction errors", () => {
        it("propagates transaction creation errors", async () => {
            const error = new Error("Transaction creation failed");

            sequelize.transaction.mockRejectedValue(error);

            await expect(createEvent(eventInput, 10)).rejects.toBe(error);

            expect(mockBuildCreateEventPayload).toHaveBeenCalledTimes(1);

            expect(Event.create).not.toHaveBeenCalled();
            expect(EventUserRole.create).not.toHaveBeenCalled();

            expect(transaction.rollback).not.toHaveBeenCalled();
        });

        it("rolls back when event creation fails", async () => {
            const error = new Error("Event creation failed");

            Event.create.mockRejectedValue(error);

            await expect(createEvent(eventInput, 10)).rejects.toBe(error);

            expect(EventUserRole.create).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });

        it("rolls back when organizer membership creation fails", async () => {
            const error = new Error("Organizer membership creation failed");

            EventUserRole.create.mockRejectedValue(error);

            await expect(createEvent(eventInput, 10)).rejects.toBe(error);

            expect(Event.create).toHaveBeenCalledTimes(1);

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });

        it("rolls back when transaction commit fails", async () => {
            const error = new Error("Transaction commit failed");

            transaction.commit.mockRejectedValue(error);

            await expect(createEvent(eventInput, 10)).rejects.toBe(error);

            expect(Event.create).toHaveBeenCalledTimes(1);
            expect(EventUserRole.create).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });
    });
});
