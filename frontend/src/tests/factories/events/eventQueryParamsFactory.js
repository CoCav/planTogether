import { EVENT_STATUS } from "../../../features/shared/constants/eventStatus";

import { createQueryParams } from "../shared/queryParamsFactory";

/* ==================================================
   EVENT QUERY PARAMS TEST FACTORY

   Handles:
   - public event query params generation
   - public event view params generation

   Notes:
   - aligned with public event query params
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   PUBLIC EVENT QUERY PARAMS
============================= */

// Generate public event query params
export const createEventQueryParams = (overrides = {}) => (
    createQueryParams({
        search: "music",
        creator: "John Doe",
        creatorId: 1,

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
        view: EVENT_STATUS.UPCOMING,

        ...overrides
    })
);
