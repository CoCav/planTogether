import { EVENT_STATUS } from "../../../features/shared/constants/eventStatus";

/* ==================================================
   EVENT VIEW TEST FACTORY

   Handles:
   - public event view generation
   - public event default view generation

   Notes:
   - aligned with public event view config
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   DEFAULT VIEW
============================= */

// Generate default public event view content
export const createDefaultEventView = (overrides = {}) => ({
    key: "default",
    label: "Events",
    icon: "📋",
    title: "Events",
    subtitle: "",
    empty: "No events found.",

    status: "",

    defaultSortBy: "createdAt",
    defaultOrder: "desc",

    showQuickActions: true,
    clearDateFiltersOnEnter: false,

    ...overrides
});

/* =============================
   PUBLIC EVENT VIEWS
============================= */

// Generate all events view content
export const createAllEventsView = (overrides = {}) => ({
    key: "all",
    label: "All",
    icon: "📋",
    title: "All Events",
    subtitle: "Browse all events and refine your search.",
    empty: "No events found.",

    status: "",

    defaultSortBy: "createdAt",
    defaultOrder: "desc",

    showQuickActions: true,
    clearDateFiltersOnEnter: false,

    ...overrides
});

// Generate ongoing events view content
export const createOngoingEventsView = (overrides = {}) => ({
    key: EVENT_STATUS.ONGOING,
    label: "Ongoing",
    icon: "⏳",
    title: "Ongoing Events",
    subtitle: "See events currently happening.",
    empty: "No ongoing events.",

    status: EVENT_STATUS.ONGOING,

    defaultSortBy: "startDateTime",
    defaultOrder: "asc",

    showQuickActions: true,
    clearDateFiltersOnEnter: false,

    ...overrides
});

// Generate upcoming events view content
export const createUpcomingEventsView = (overrides = {}) => ({
    key: EVENT_STATUS.UPCOMING,
    label: "Upcoming",
    icon: "📅",
    title: "Upcoming Events",
    subtitle: "Discover upcoming events and plan ahead.",
    empty: "No upcoming events.",

    status: EVENT_STATUS.UPCOMING,

    defaultSortBy: "startDateTime",
    defaultOrder: "asc",

    showQuickActions: true,
    clearDateFiltersOnEnter: false,

    ...overrides
});

// Generate past events view content
export const createPastEventsView = (overrides = {}) => ({
    key: EVENT_STATUS.PAST,
    label: "Archives",
    icon: "🗂️",
    title: "Archives",
    subtitle: "Explore past events.",
    empty: "No archived events.",

    status: EVENT_STATUS.PAST,

    defaultSortBy: "startDateTime",
    defaultOrder: "desc",

    showQuickActions: false,
    clearDateFiltersOnEnter: true,

    ...overrides
});
