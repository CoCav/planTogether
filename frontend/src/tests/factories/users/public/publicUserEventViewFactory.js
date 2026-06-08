import { FolderOpen, Bookmark } from "lucide-react";

/* ==================================================
   PUBLIC USER EVENT VIEW TEST FACTORY

   Handles:
   - public user event view generation
   - public user default view generation
   - decorative tab icon configuration

   Notes:
   - aligned with public user event view config
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   DEFAULT VIEW
============================= */

// Generate default public user event view content
export const createDefaultPublicUserEventView = (overrides = {}) => ({
    key: "created",
    label: "Created",
    icon: FolderOpen,
    title: "Created Events",
    subtitle: "Public events created by this user.",
    empty: "No created events found.",

    defaultSortBy: "startDateTime",
    defaultOrder: "asc",

    ...overrides
});

/* =============================
   PUBLIC USER EVENT VIEWS
============================= */

// Generate public user created events view content
export const createPublicUserCreatedEventsView = (overrides = {}) => ({
    key: "created",
    label: "Created",
    icon: FolderOpen,
    title: "Created Events",
    subtitle: "Public events created by this user.",
    empty: "No created events found.",

    defaultSortBy: "startDateTime",
    defaultOrder: "asc",

    ...overrides
});

// Generate public user joined events view content
export const createPublicUserJoinedEventsView = (overrides = {}) => ({
    key: "joined",
    label: "Joined",
    icon: Bookmark,
    title: "Joined Events",
    subtitle: "Public events joined by this user.",
    empty: "No joined events found.",

    defaultSortBy: "startDateTime",
    defaultOrder: "asc",

    ...overrides
});
