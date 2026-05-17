import { EVENT_ROLES } from "../../../../features/shared/eventRoles";

import { createEvent } from "../../events/eventFactory";

/* ==================================================
   MY EVENT TEST FACTORY

   Handles:
   - current user event item generation
   - current user event list generation
   - paginated current user event payload generation

   Notes:
   - shared across authenticated user event tests
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   CURRENT USER EVENT ITEMS
============================= */

// Generate a current user event membership item
export const createMyEventItem = ({
    event = createEvent(),
    ...overrides
} = {}) => ({

    id: 10,

    role: EVENT_ROLES.PARTICIPANT,

    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-02T10:00:00.000Z",

    event,

    ...overrides
});

// Generate a current user event membership item with Event alias
export const createMyEventItemWithEventAlias = ({
    Event = createEvent(),
    ...overrides
} = {}) => ({

    id: 10,

    role: EVENT_ROLES.PARTICIPANT,

    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-02T10:00:00.000Z",

    Event,

    ...overrides
});

// Generate a direct current user event item
export const createDirectMyEventItem = (overrides = {}) => ({
    ...createEvent(),

    ...overrides
});

/* =============================
   CURRENT USER EVENT LISTS
============================= */

// Generate current user event items
export const createMyEventList = (items = [
    createMyEventItem()
]) => items;

/* =============================
   PAGINATED PAYLOADS
============================= */

// Generate a paginated current user events payload
export const createPaginatedMyEventsPayload = (overrides = {}) => ({
    events: [
        createMyEventItem()
    ],

    page: 1,
    pageSize: 10,

    totalEvents: 1,
    totalPages: 1,

    message: "Events retrieved",
    success: true,

    ...overrides
});
