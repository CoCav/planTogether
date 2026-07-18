/* =============================
   MOCK FUNCTIONS
============================= */

const mockSequelize = {
    authenticate: jest.fn(),
    sync: jest.fn()
};

const mockLogger = {
    info: jest.fn(),
    error: jest.fn()
};

const createMockModel = (name) => ({
    name,
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    belongsToMany: jest.fn()
});

const mockUser = createMockModel("User");
const mockEvent = createMockModel("Event");
const mockLocation = createMockModel("Location");

const mockEventUserRole = createMockModel("EventUserRole");
const mockEventReview = createMockModel("EventReview");
const mockEventLike = createMockModel("EventLike");

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../src/config/database", () => (mockSequelize));

jest.mock("../../../src/config/logger", () => (mockLogger));
jest.mock("../../../src/models/userModel", () => (mockUser));
jest.mock("../../../src/models/eventModel", () => (mockEvent));
jest.mock("../../../src/models/locationModel", () => (mockLocation));

jest.mock("../../../src/models/associations/eventUserRoleModel", () => mockEventUserRole);
jest.mock("../../../src/models/associations/eventReviewModel", () => mockEventReview);
jest.mock("../../../src/models/associations/eventLikeModel", () => mockEventLike);

/* =============================
   TEST HELPERS
============================= */

const loadModelsIndex = () => {
    jest.resetModules();

    return require("../../../src/models");
};

/* ==========================================================================
   Models Index Unit Tests

   Tests database initialization and model association registration.

   Responsibilities
   - Test database connection initialization
   - Test environment-specific model synchronization
   - Test database initialization logging
   - Test database initialization error forwarding
   - Test model exports
   - Test creator relationships
   - Test participation relationships
   - Test review relationships
   - Test like relationships
   - Test event membership relationships

   Notes
   - Sequelize, logging and model modules are mocked.
   - Associations are registered when the models index is loaded.
=========================================================================== */

describe("models index", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
        jest.clearAllMocks();

        process.env.NODE_ENV = "development";

        mockSequelize.authenticate.mockResolvedValue();
        mockSequelize.sync.mockResolvedValue();
    });

    afterAll(() => {
        process.env.NODE_ENV = originalNodeEnv;
        jest.resetModules();
    });

    /* =============================
       MODEL EXPORTS
    ============================= */

    describe("Model exports", () => {
        it("exports the database instance and registered models", () => {
            const models = loadModelsIndex();

            expect(models).toEqual({
                sequelize: mockSequelize,
                initDB: expect.any(Function),
                User: mockUser,
                Event: mockEvent,
                Location: mockLocation,
                EventUserRole: mockEventUserRole,
                EventReview: mockEventReview,
                EventLike: mockEventLike
            });
        });
    });

    /* =============================
       DATABASE INITIALIZATION
    ============================= */

    describe("Database initialization", () => {
        it("authenticates the database before synchronizing models", async () => {
            const { initDB } = loadModelsIndex();

            await initDB();

            expect(mockSequelize.authenticate).toHaveBeenCalledTimes(1);

            expect(mockSequelize.sync).toHaveBeenCalledTimes(1);

            expect(mockSequelize.authenticate.mock.invocationCallOrder[0]).toBeLessThan(mockSequelize.sync.mock.invocationCallOrder[0]);
        });

        it("logs successful database initialization progress", async () => {
            const { initDB } = loadModelsIndex();

            await initDB();

            expect(mockLogger.info.mock.calls).toEqual([[
                "Connecting to database..."
            ], [
                "Database connection established."
            ], [
                "Synchronizing database models..."
            ], [
                "Database synchronized."
            ]]);

            expect(mockLogger.error).not.toHaveBeenCalled();
        });
    });

    /* =============================
       DATABASE SYNCHRONIZATION
    ============================= */

    describe("Environment synchronization", () => {
        it("uses alter synchronization in development", async () => {
            process.env.NODE_ENV = "development";

            const { initDB } = loadModelsIndex();

            await initDB();

            expect(mockSequelize.sync).toHaveBeenCalledWith({
                alter: true
            });
        });

        it("uses force synchronization in tests", async () => {
            process.env.NODE_ENV = "test";

            const { initDB } = loadModelsIndex();

            await initDB();

            expect(mockSequelize.sync).toHaveBeenCalledWith({
                force: true
            });
        });

        it.each([
            "production",
            "staging",
            undefined
        ])(
            "uses safe synchronization when NODE_ENV is %s", async (nodeEnv) => {
                if (nodeEnv === undefined) {
                    delete process.env.NODE_ENV;
                } else {
                    process.env.NODE_ENV = nodeEnv;
                }

                const { initDB } = loadModelsIndex();

                await initDB();

                expect(mockSequelize.sync).toHaveBeenCalledWith();
            }
        );
    });

    /* =============================
       DATABASE INITIALIZATION ERRORS
    ============================= */

    describe("Database initialization errors", () => {
        it("logs and rethrows authentication errors", async () => {
            const authenticationError = new Error("Database authentication failed");

            mockSequelize.authenticate.mockRejectedValue(authenticationError);

            const { initDB } = loadModelsIndex();

            await expect(initDB()).rejects.toBe(authenticationError);

            expect(mockSequelize.sync).not.toHaveBeenCalled();

            expect(mockLogger.error).toHaveBeenCalledWith(
                {
                    error: authenticationError
                },
                "Error initializing the database"
            );
        });

        it("logs and rethrows synchronization errors", async () => {
            const synchronizationError = new Error("Database synchronization failed");

            mockSequelize.sync.mockRejectedValue(synchronizationError);

            const { initDB } = loadModelsIndex();

            await expect(initDB()).rejects.toBe(synchronizationError);

            expect(mockSequelize.authenticate).toHaveBeenCalledTimes(1);

            expect(mockLogger.error).toHaveBeenCalledWith(
                {
                    error: synchronizationError
                },
                "Error initializing the database"
            );
        });
    });

    /* =============================
       CREATOR RELATIONSHIPS
    ============================= */

    describe("Creator relationships", () => {
        it("registers event creator associations", () => {
            loadModelsIndex();

            expect(mockUser.hasMany).toHaveBeenCalledWith(mockEvent, {
                foreignKey: "creatorId"
            });

            expect(mockEvent.belongsTo).toHaveBeenCalledWith(mockUser, {
                foreignKey: "creatorId",
                as: "creator"
            });
        });
    });

    /* =============================
       PARTICIPATION RELATIONSHIPS
    ============================= */

    describe("Participation relationships", () => {
        it("registers the user-to-event participation association", () => {
            loadModelsIndex();

            expect(mockUser.belongsToMany).toHaveBeenCalledWith(mockEvent, {
                through: {
                    model: mockEventUserRole,
                    attributes: [
                        "role",
                        "joinedAt"
                    ]
                },
                foreignKey: "userId",
                otherKey: "eventId",
                as: "events"
            });
        });

        it("registers the event-to-user participant association", () => {
            loadModelsIndex();

            expect(mockEvent.belongsToMany).toHaveBeenCalledWith(mockUser, {
                through: {
                    model: mockEventUserRole,
                    attributes: [
                        "role",
                        "joinedAt"
                    ]
                },
                foreignKey: "eventId",
                otherKey: "userId",
                as: "participants"
            });
        });
    });

    /* =============================
       REVIEW RELATIONSHIPS
    ============================= */

    describe("Review relationships", () => {
        it("registers user review associations", () => {
            loadModelsIndex();

            expect(mockUser.hasMany).toHaveBeenCalledWith(mockEventReview, {
                foreignKey: "userId",
                as: "reviews"
            });

            expect(mockEventReview.belongsTo).toHaveBeenCalledWith(mockUser, {
                foreignKey: "userId",
                as: "user"
            });
        });

        it("registers event review associations", () => {
            loadModelsIndex();

            expect(mockEvent.hasMany).toHaveBeenCalledWith(mockEventReview, {
                foreignKey: "eventId",
                as: "reviews"
            });

            expect(mockEventReview.belongsTo).toHaveBeenCalledWith(mockEvent, {
                foreignKey: "eventId",
                as: "event"
            });
        });
    });

    /* =============================
       LIKE RELATIONSHIPS
    ============================= */

    describe("Like relationships", () => {
        it("registers user like associations", () => {
            loadModelsIndex();

            expect(mockUser.hasMany).toHaveBeenCalledWith(mockEventLike, {
                foreignKey: "userId",
                as: "likes"
            });

            expect(mockEventLike.belongsTo).toHaveBeenCalledWith(mockUser, {
                foreignKey: "userId",
                as: "user"
            });
        });

        it("registers event like associations", () => {
            loadModelsIndex();

            expect(mockEvent.hasMany).toHaveBeenCalledWith(mockEventLike, {
                foreignKey: "eventId",
                as: "likes"
            });

            expect(mockEventLike.belongsTo).toHaveBeenCalledWith(mockEvent, {
                foreignKey: "eventId",
                as: "event"
            });
        });
    });

    /* =============================
       EVENT MEMBERSHIP RELATIONSHIPS
    ============================= */

    describe("Event membership relationships", () => {
        it("registers membership ownership associations", () => {
            loadModelsIndex();

            expect(mockEventUserRole.belongsTo).toHaveBeenCalledWith(mockUser, {
                foreignKey: "userId"
            });

            expect(mockEventUserRole.belongsTo).toHaveBeenCalledWith(mockEvent, {
                foreignKey: "eventId",
                as: "event"
            });
        });

        it("registers user and event membership collections", () => {
            loadModelsIndex();

            expect(mockUser.hasMany).toHaveBeenCalledWith(mockEventUserRole, {
                foreignKey: "userId"
            });

            expect(mockEvent.hasMany).toHaveBeenCalledWith(mockEventUserRole, {
                foreignKey: "eventId"
            });
        });
    });
});
