/* ==================================================
   PUBLIC USER EVENT VIEW CONFIG
   Centralizes public user event tab configuration

   Handles:
   - tab labels and icons
   - section titles and subtitles
   - default sorting per view

   Notes:
   - aligned with GET /users/:id/events
================================================== */

export const DEFAULT_PUBLIC_USER_EVENT_VIEW_CONTENT = {
    key: "created",
    label: "Created",
    icon: "🛠️",
    title: "Created Events",
    subtitle: "Public events created by this user.",
    empty: "No created events found.",
    defaultSortBy: "startDateTime",
    defaultOrder: "asc"
};

/* =============================
   PUBLIC USER EVENT VIEWS
============================= */

export const PUBLIC_USER_EVENT_VIEWS = [
    {
        key: "created",
        label: "Created",
        icon: "🛠️",
        title: "Created Events",
        subtitle: "Public events created by this user.",
        empty: "No created events found.",
        defaultSortBy: "startDateTime",
        defaultOrder: "asc"
    },

    {
        key: "joined",
        label: "Joined",
        icon: "🤝",
        title: "Joined Events",
        subtitle: "Public events joined by this user.",
        empty: "No joined events found.",
        defaultSortBy: "startDateTime",
        defaultOrder: "asc"
    }
];

/* =============================
   VIEW CONTENT RESOLVER
============================= */

// Finds the active public user event view configuration
export const getPublicUserEventViewContent = (activeView) => {
    return (
        PUBLIC_USER_EVENT_VIEWS.find(
            (view) => view.key === activeView
        ) || DEFAULT_PUBLIC_USER_EVENT_VIEW_CONTENT
    );
};
