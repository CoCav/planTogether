import { useCallback, useMemo, useState } from "react";

import { getPublicUserProfile, getPublicUserEvents } from "../../../../api/users/userApi";

import { getNormalizedPublicUserProfile } from "../publicUserNormalizer";
import { getNormalizedPublicUserEvents } from "../publicUserEventNormalizer";
import { getPublicUserEventViewContent } from "../publicUserEventViewConfig";

/* ==================================================
   USE PUBLIC USER LISTING DATA
   Handles public user profile and event listing data loading

   Handles:
   - public user profile loading
   - public created/joined event loading
   - public user payload normalization
   - active event view state
   - visible event resolution
================================================== */

export default function usePublicUserListingData(userId) {

    /* =============================
       STATE
    ============================= */

    const [profile, setProfile] = useState({
        user: {
            name: "",
            avatar: null
        },
        stats: {
            createdEventsCount: 0,
            joinedEventsCount: 0
        }
    });

    const [events, setEvents] = useState({
        createdEvents: [],
        joinedEvents: []
    });

    const [activeView, setActiveView] = useState("created");

    const [initialLoading, setInitialLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState("");

    /* =============================
       DATA LOADING
    ============================= */

    const loadData = useCallback(async () => {
        try {
            setError("");
            setIsLoading(true);

            const [profilePayload, eventsPayload] = await Promise.all([
                getPublicUserProfile(userId),
                getPublicUserEvents(userId)
            ]);

            setProfile(getNormalizedPublicUserProfile(profilePayload));
            setEvents(getNormalizedPublicUserEvents(eventsPayload));

        } catch (error) {
            console.error("Error loading public user:", error);

            setError("❌ Failed to load public user profile");

        } finally {
            setIsLoading(false);
            setInitialLoading(false);
        }
    }, [userId]);

    /* =============================
       VIEW RESOLUTION
    ============================= */

    const viewContent = useMemo(
        () => getPublicUserEventViewContent(activeView),
        [activeView]
    );

    const visibleEvents = useMemo(() => {
        return activeView === "joined"
            ? events.joinedEvents
            : events.createdEvents;
    }, [
        activeView,
        events
    ]);

    return {
        profile,
        events,
        visibleEvents,

        activeView,
        setActiveView,
        viewContent,

        initialLoading,
        isLoading,

        error,
        setError,

        loadData
    };
}
