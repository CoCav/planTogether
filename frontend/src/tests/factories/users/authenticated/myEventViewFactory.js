import { Archive, FolderOpen, Bookmark } from "lucide-react";

/* ==================================================
   MY EVENT VIEW TEST FACTORY

   Handles:
   - current user event view generation
   - current user default view generation
   - decorative tab icon configuration

   Notes:
   - aligned with current user event view config
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   DEFAULT VIEW
============================= */

export const createDefaultMyEventView = (overrides = {}) => ({
    key: "created",
    label: "Created",
    icon: FolderOpen,
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

export const createCreatedEventsView = (overrides = {}) => ({
    key: "created",
    label: "Created",
    icon: FolderOpen,
    title: "Created Events",
    subtitle: "Events you created as organizer.",
    empty: "You haven’t created any events yet.",

    defaultSortBy: "startDateTime",
    defaultOrder: "asc",

    showQuickActions: true,
    clearDateFiltersOnEnter: false,

    ...overrides
});

export const createCreatedHistoryView = (overrides = {}) => ({
    key: "createdHistory",
    label: "Created History",
    icon: Archive,
    title: "Created History",
    subtitle: "Explore past events you created.",
    empty: "No past created events.",

    defaultSortBy: "startDateTime",
    defaultOrder: "desc",

    showQuickActions: false,
    clearDateFiltersOnEnter: true,

    ...overrides
});

export const createJoinedEventsView = (overrides = {}) => ({
    key: "joined",
    label: "Joined",
    icon: Bookmark,
    title: "Joined Events",
    subtitle: "Events you joined.",
    empty: "You haven’t joined any events yet.",

    defaultSortBy: "startDateTime",
    defaultOrder: "asc",

    showQuickActions: true,
    clearDateFiltersOnEnter: false,

    ...overrides
});

export const createJoinedHistoryView = (overrides = {}) => ({
    key: "joinedHistory",
    label: "Joined History",
    icon: Archive,
    title: "Joined History",
    subtitle: "Explore past events you joined.",
    empty: "No past joined events.",

    defaultSortBy: "startDateTime",
    defaultOrder: "desc",

    showQuickActions: false,
    clearDateFiltersOnEnter: true,

    ...overrides
});
