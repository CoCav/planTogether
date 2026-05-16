/* ==================================================
   MY EVENT VIEW TEST FACTORY

   Handles:
   - current user event view generation
   - current user default view generation

   Notes:
   - aligned with current user event view config
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   DEFAULT VIEW
============================= */

// Generate default current user event view content
export const createDefaultMyEventView = (overrides = {}) => ({
    key: "created",
    label: "Created",
    icon: "🛠️",
    title: "Created Events",
    subtitle: "Events you created as organizer.",
    empty: "You haven’t created any events yet.",

    defaultSortBy: "startDateTime",
    defaultOrder: "asc",

    showQuickActions: true,
    clearDateFiltersOnEnter: false,

    ...overrides
});

/* =============================
   CURRENT USER EVENT VIEWS
============================= */

// Generate created events view content
export const createCreatedEventsView = (overrides = {}) => ({
    key: "created",
    label: "Created",
    icon: "🛠️",
    title: "Created Events",
    subtitle: "Events you created as organizer.",
    empty: "You haven’t created any events yet.",

    defaultSortBy: "startDateTime",
    defaultOrder: "asc",

    showQuickActions: true,
    clearDateFiltersOnEnter: false,

    ...overrides
});

// Generate created history view content
export const createCreatedHistoryView = (overrides = {}) => ({
    key: "createdHistory",
    label: "Created History",
    icon: "📜",
    title: "Created History",
    subtitle: "Explore past events you created.",
    empty: "No past created events.",

    defaultSortBy: "startDateTime",
    defaultOrder: "desc",

    showQuickActions: false,
    clearDateFiltersOnEnter: true,

    ...overrides
});

// Generate joined events view content
export const createJoinedEventsView = (overrides = {}) => ({
    key: "joined",
    label: "Joined",
    icon: "🤝",
    title: "Joined Events",
    subtitle: "Events you joined.",
    empty: "You haven’t joined any events yet.",

    defaultSortBy: "startDateTime",
    defaultOrder: "asc",

    showQuickActions: true,
    clearDateFiltersOnEnter: false,

    ...overrides
});

// Generate joined history view content
export const createJoinedHistoryView = (overrides = {}) => ({
    key: "joinedHistory",
    label: "Joined History",
    icon: "🗂️",
    title: "Joined History",
    subtitle: "Explore past events you joined.",
    empty: "No past joined events.",

    defaultSortBy: "startDateTime",
    defaultOrder: "desc",

    showQuickActions: false,
    clearDateFiltersOnEnter: true,

    ...overrides
});
