import { EVENT_STATUS } from "../../../../features/shared/constants/eventStatus";

import { createQueryParams } from "../../shared/queryParamsFactory";

/* ==================================================
   MY EVENT QUERY PARAMS TEST FACTORY

   Handles:
   - current user event query params generation
   - current user event view params generation

   Notes:
   - aligned with current user event query params
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   CURRENT USER EVENT QUERY PARAMS
============================= */

// Generate current user event query params
export const createMyEventQueryParams = (overrides = {}) => (
    createQueryParams({
        search: "music",
        creator: "John Doe",

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
        view: "joined",

        ...overrides
    })
);
