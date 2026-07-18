/* =============================
   MOCK FUNCTIONS
============================= */

const mockResolveEventLocation = jest.fn();
const mockNormalizeString = jest.fn();

const mockFindEventByIdOrFail = jest.fn();
const mockAssertEventNotPast = jest.fn();
const mockBuildUpdateEventPayload = jest.fn();
const mockDeleteUploadedFile = jest.fn();

/* =============================
   TEST MOCKS
============================= */

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
    name: "EventUserRole"
}));

jest.mock("../../../../src/models/associations/eventReviewModel", () => ({
    name: "EventReview"
}));

jest.mock("../../../../src/models/associations/eventLikeModel", () => ({
    name: "EventLike"
}));

jest.mock("../../../../src/services/geocodingService", () => ({
    resolveEventLocation:
        mockResolveEventLocation
}));

jest.mock("../../../../src/utils/stringNormalizer", () => ({
    normalizeString: mockNormalizeString
}));

jest.mock("../../../../src/utils/events/eventQueries", () => ({
    findEventByIdOrFail: mockFindEventByIdOrFail
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    assertEventNotPast: mockAssertEventNotPast,
    assertEventNotStarted: jest.fn(),
    hasEventStarted: jest.fn(),
    getEventStatus: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventPayloadBuilder", () => ({
    buildCreateEventPayload: jest.fn(),
    buildUpdateEventPayload: mockBuildUpdateEventPayload
}));

jest.mock("../../../../src/utils/files/uploadedFileStorage", () => ({
    deleteUploadedFile: mockDeleteUploadedFile
}));

jest.mock("../../../../src/utils/events/eventFilters", () => ({
    buildEventWhereConditions: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventCreatorInclude", () => ({
    buildEventCreatorInclude: jest.fn()
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

jest.mock("../../../../src/utils/pagination", () => ({
    getPaginationOptions: jest.fn(),
    getTotalCount: jest.fn(),
    getTotalPages: jest.fn()
}));

/* =============================
   TEST IMPORTS
============================= */

const sequelize = require("../../../../src/config/database");

const Event = require("../../../../src/models/eventModel");

const { EVENT_MODES } = require("../../../../src/constants/eventModes");

const { updateEventById } = require("../../../../src/services/eventService");

const { createTransactionMock } = require("../../../helpers/database/modelTestHelper");

const { createMockEventModel } = require("../../../factories/eventFactory");

/* ==========================================================================
   Update Event Service Unit Tests

   Tests event update business logic.

   Responsibilities
   - Test event existence and lifecycle validation
   - Test complete and partial date validation
   - Test event location validation and geocoding
   - Test update payload construction
   - Test event persistence
   - Test image replacement and removal
   - Test post-commit file cleanup
   - Test transaction commit and rollback
   - Test unexpected error propagation

   Notes
   - Database changes run inside a transaction.
   - Old uploaded images are removed only after the transaction commits.
   - File cleanup failures cannot roll back committed database changes.
=========================================================================== */

describe("update event service", () => {
    let transaction;
    let event;
    let locationData;

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = createTransactionMock();

        event = createMockEventModel({
            id: 1,
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z",
            image: null,
            update: jest.fn().mockResolvedValue()
        });

        locationData = {
            latitude: 46.8137431,
            longitude: -71.2084061,
            label: "Québec, Canada",
            streetAddress: "2 Rue des Jardins",
            city: "Québec",
            region: "Québec",
            postalCode: "G1R 4L5",
            country: "Canada"
        };

        sequelize.transaction.mockResolvedValue(transaction);

        mockFindEventByIdOrFail.mockResolvedValue(event);

        mockAssertEventNotPast.mockImplementation(() => { });

        mockNormalizeString.mockImplementation(
            (value) => String(value ?? "").trim()
        );

        mockResolveEventLocation.mockResolvedValue(locationData);

        mockBuildUpdateEventPayload.mockReturnValue({
            title: "Updated Event"
        });

        mockDeleteUploadedFile.mockResolvedValue();
    });

    /* =============================
       EVENT UPDATE
    ============================= */

    describe("updateEventById", () => {
        it("updates and returns the event inside a transaction", async () => {
            const data = {
                title: "Updated Event"
            };

            const updatedData = {
                title: "Updated Event"
            };

            mockBuildUpdateEventPayload.mockReturnValue(updatedData);

            const result = await updateEventById(1, data);

            expect(sequelize.transaction).toHaveBeenCalledTimes(1);

            expect(mockFindEventByIdOrFail).toHaveBeenCalledWith(Event, 1, {
                transaction
            });

            expect(mockAssertEventNotPast).toHaveBeenCalledWith(event);

            expect(mockBuildUpdateEventPayload).toHaveBeenCalledWith(event, data, null);

            expect(event.update).toHaveBeenCalledWith(updatedData, {
                transaction
            });

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).not.toHaveBeenCalled();

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();

            expect(result).toBe(event);
        });

        it("preserves location data when the location field is omitted", async () => {
            const data = {
                title: "Updated Event"
            };

            await updateEventById(1, data);

            expect(mockNormalizeString).not.toHaveBeenCalled();

            expect(mockResolveEventLocation).not.toHaveBeenCalled();

            expect(mockBuildUpdateEventPayload).toHaveBeenCalledWith(event, data, null);
        });
    });

    /* =============================
       DATE VALIDATION
    ============================= */

    describe("Date validation", () => {
        it.each([[
            "both supplied dates are reversed",
            {
                startDateTime: "2026-12-20T13:00:00.000Z",
                endDateTime: "2026-12-20T12:00:00.000Z"
            }
        ], [
            "both supplied dates are equal",
            {
                startDateTime: "2026-12-20T12:00:00.000Z",
                endDateTime: "2026-12-20T12:00:00.000Z"
            }
        ], [
            "only the new start date is after the existing end date",
            {
                startDateTime: "2026-12-20T13:00:00.000Z"
            }
        ], [
            "only the new end date is before the existing start date",
            {
                endDateTime: "2026-12-20T09:00:00.000Z"
            }
        ]])(
            "throws a 400 error when %s", async (_, data) => {
                await expect(
                    updateEventById(1, data)
                ).rejects.toMatchObject({
                    message: "End date must be after start date",
                    statusCode: 400
                });

                expect(mockBuildUpdateEventPayload).not.toHaveBeenCalled();

                expect(event.update).not.toHaveBeenCalled();

                expect(transaction.commit).not.toHaveBeenCalled();

                expect(transaction.rollback).toHaveBeenCalledTimes(1);

                expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
            }
        );

        it.each([[
            "only the start date",
            {
                startDateTime:
                    "2026-12-20T11:00:00.000Z"
            }
        ], [
            "only the end date",
            {
                endDateTime:
                    "2026-12-20T13:00:00.000Z"
            }
        ]])(
            "accepts a valid update containing %s", async (_, data) => {
                await updateEventById(1, data);

                expect(mockBuildUpdateEventPayload).toHaveBeenCalledWith(event, data, null);

                expect(event.update).toHaveBeenCalledTimes(1);

                expect(transaction.commit).toHaveBeenCalledTimes(1);
            }
        );
    });

    /* =============================
       LOCATION UPDATES
    ============================= */

    describe("Location updates", () => {
        it("resolves location data when an in-person address changes", async () => {
            const data = {
                location: "Quebec City"
            };

            const updatedData = {
                location: "Quebec City",
                locationLabel: "Québec, Canada",
                latitude: 46.8137431,
                longitude: -71.2084061
            };

            mockBuildUpdateEventPayload.mockReturnValue(updatedData);

            await updateEventById(1, data);

            expect(mockNormalizeString).toHaveBeenCalledWith("Quebec City");

            expect(mockResolveEventLocation).toHaveBeenCalledTimes(1);
            expect(mockResolveEventLocation).toHaveBeenCalledWith("Quebec City");

            expect(mockBuildUpdateEventPayload).toHaveBeenCalledWith(event, data, locationData);

            expect(event.update).toHaveBeenCalledWith(updatedData, {
                transaction
            });
        });

        it("throws a 400 error for a blank in-person location", async () => {
            const data = {
                location: "   "
            };

            await expect(
                updateEventById(1, data)
            ).rejects.toMatchObject({
                message: "Location is required for in-person events",
                statusCode: 400
            });

            expect(mockNormalizeString).toHaveBeenCalledWith("   ");

            expect(mockResolveEventLocation).not.toHaveBeenCalled();

            expect(mockBuildUpdateEventPayload).not.toHaveBeenCalled();

            expect(event.update).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });

        it("switches an event to online mode without geocoding", async () => {
            const data = {
                mode: EVENT_MODES.ONLINE
            };

            const updatedData = {
                mode: EVENT_MODES.ONLINE,
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

            mockBuildUpdateEventPayload.mockReturnValue(updatedData);

            await updateEventById(1, data);

            expect(mockResolveEventLocation).not.toHaveBeenCalled();

            expect(mockBuildUpdateEventPayload).toHaveBeenCalledWith(event, data, null);

            expect(event.update).toHaveBeenCalledWith(updatedData, {
                transaction
            });
        });

        it("does not geocode an explicitly supplied location when the next mode is online", async () => {
            const data = {
                mode: EVENT_MODES.ONLINE,
                location: "Ignored location"
            };

            await updateEventById(1, data);

            expect(mockResolveEventLocation).not.toHaveBeenCalled();

            expect(mockBuildUpdateEventPayload).toHaveBeenCalledWith(event, data, null);
        });

        it("propagates geocoding errors and rolls back", async () => {
            const error = new Error("Geocoding failed");

            mockResolveEventLocation.mockRejectedValue(error);

            await expect(updateEventById(1, {
                location: "Quebec City"
            })).rejects.toBe(error);

            expect(mockBuildUpdateEventPayload).not.toHaveBeenCalled();

            expect(event.update).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });
    });

    /* =============================
       IMAGE CLEANUP
    ============================= */

    describe("Image cleanup", () => {
        beforeEach(() => {
            event.image = "/uploads/events/old-event.png";
        });

        it("deletes the previous image after a successful replacement", async () => {
            const data = {
                image: "/uploads/events/new-event.png"
            };

            await updateEventById(1, data);

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).toHaveBeenCalledWith("/uploads/events/old-event.png");

            expect(transaction.commit.mock.invocationCallOrder[0]).toBeLessThan(mockDeleteUploadedFile.mock.invocationCallOrder[0]);
        });

        it("deletes the previous image after explicit image removal", async () => {
            await updateEventById(1, {
                image: null
            });

            expect(mockDeleteUploadedFile).toHaveBeenCalledWith("/uploads/events/old-event.png");
        });

        it("preserves the previous image when the image field is omitted", async () => {
            await updateEventById(1, {
                title: "Updated Event"
            });

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });

        it("does not delete the image when the same path is supplied", async () => {
            await updateEventById(1, {
                image: "/uploads/events/old-event.png"
            });

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });

        it("propagates post-commit cleanup errors without rolling back", async () => {
            const error = new Error("File cleanup failed");

            mockDeleteUploadedFile.mockRejectedValue(error);

            await expect(updateEventById(1, {
                image: "/uploads/events/new-event.png"
            })).rejects.toBe(error);

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            // Database changes are already committed.
            expect(transaction.rollback).not.toHaveBeenCalled();
        });
    });

    /* =============================
       EVENT VALIDATION
    ============================= */

    describe("Event validation", () => {
        it("rolls back when the event does not exist", async () => {
            const error = Object.assign(new Error("Event not found"), {
                statusCode: 404
            });

            mockFindEventByIdOrFail.mockRejectedValue(error);

            await expect(updateEventById(999, {
                title: "Updated Event"
            })).rejects.toBe(error);

            expect(mockAssertEventNotPast).not.toHaveBeenCalled();

            expect(mockBuildUpdateEventPayload).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });

        it("rolls back when the event is past", async () => {
            const error = Object.assign(new Error("No action is allowed on a past event"), {
                statusCode: 403
            });

            mockAssertEventNotPast.mockImplementation(() => {
                throw error;
            });

            await expect(updateEventById(1, {
                title: "Updated Event"
            })).rejects.toBe(error);

            expect(mockBuildUpdateEventPayload).not.toHaveBeenCalled();

            expect(event.update).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });
    });

    /* =============================
       TRANSACTION ERRORS
    ============================= */

    describe("Transaction errors", () => {
        it("propagates transaction creation errors", async () => {
            const error = new Error("Transaction creation failed");

            sequelize.transaction.mockRejectedValue(error);

            await expect(updateEventById(1, {
                title: "Updated Event"
            })).rejects.toBe(error);

            expect(mockFindEventByIdOrFail).not.toHaveBeenCalled();

            expect(transaction.rollback).not.toHaveBeenCalled();
        });

        it("rolls back when payload construction fails", async () => {
            const error = new Error("Payload construction failed");

            mockBuildUpdateEventPayload.mockImplementation(() => {
                throw error;
            });

            await expect(updateEventById(1, {
                title: "Updated Event"
            })).rejects.toBe(error);

            expect(event.update).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });

        it("rolls back when event persistence fails", async () => {
            const error = new Error("Event update failed");

            event.update.mockRejectedValue(error);

            await expect(updateEventById(1, {
                title: "Updated Event"
            })).rejects.toBe(error);

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });

        it("rolls back when transaction commit fails", async () => {
            const error = new Error("Transaction commit failed");

            transaction.commit.mockRejectedValue(error);

            await expect(updateEventById(1, {
                title: "Updated Event"
            })).rejects.toBe(error);

            expect(event.update).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });
    });
});
