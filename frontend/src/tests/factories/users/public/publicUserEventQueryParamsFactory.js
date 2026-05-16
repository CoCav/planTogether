import { EVENT_STATUS } from "../../../../features/shared/eventStatus";

import { createQueryParams } from "../../shared/queryParamsFactory";

/* ==================================================
   PUBLIC USER EVENT QUERY PARAMS TEST FACTORY

   Handles:
   - public user event query params generation

   Notes:
   - aligned with public user event query params
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   PUBLIC USER EVENT QUERY PARAMS
============================= */

// Generate public user event query params
export const createPublicUserEventQueryParams = (overrides = {}) => (
    createQueryParams({
        search: "music",

        type: "Meetup",
        theme: "Tech",

        mode: "online",
        location: "Montreal",

        status: EVENT_STATUS.UPCOMING,

        date: "",
        startDate: "",
        endDate: "",

        sortBy: "title",
        order: "desc",

        page: 2,

        ...overrides
    })
);
