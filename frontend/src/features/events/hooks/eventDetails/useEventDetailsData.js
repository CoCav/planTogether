import { useCallback, useState } from "react";

import { getEventById } from "../../../../api/events/eventApi";

import { getEventMembers, getEventStaff } from "../../../../api/eventMemberships/eventMembershipApi";

import { getNormalizedEvent } from "../../eventNormalizer";

import { getNormalizedEventStaff, getNormalizedMembers } from "../../../eventMemberships/eventMembershipNormalizer";

/* ==================================================
   USE EVENT DETAILS DATA
   Handles event details data loading

   Handles:
   - event details loading
   - member list loading
   - staff list loading
   - response normalization
   - data refresh after mutations
================================================== */

export default function useEventDetailsData({ eventId, setError, setLoading }) {

    /* =============================
       DATA STATE
    ============================= */

    const [event, setEvent] = useState(null);
    const [members, setMembers] = useState([]);
    const [staff, setStaff] = useState([]);

    /* =============================
       DATA LOADING
    ============================= */

    const loadData = useCallback(async () => {
        try {
            setError("");
            setLoading(true);

            const [eventRes, staffRes, membersRes] = await Promise.all([
                getEventById(eventId),
                getEventStaff(eventId),
                getEventMembers(eventId)
            ]);

            setEvent(getNormalizedEvent(eventRes));
            setStaff(getNormalizedEventStaff(staffRes));
            setMembers(getNormalizedMembers(membersRes));
        } catch (error) {

            console.error("Error loading event details:", error);
            setError("Failed to load event details");
        } finally {
            setLoading(false);
        }
    }, [
        eventId,
        setError,
        setLoading
    ]);

    return {
        event,
        members,
        staff,
        loadData
    };
}
