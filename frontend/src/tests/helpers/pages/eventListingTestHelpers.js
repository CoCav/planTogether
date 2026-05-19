import { expect } from "vitest";

/* ==================================================
   EVENT LISTING TEST HELPERS

   Handles:
   - authenticated / guest test user setup
   - paginated API expectations
   - loaded empty listing state
================================================== */

/* =============================
   AUTH STATE
============================= */

export const createAuthenticatedTestUser = (overrides = {}) => ({
    user: {
        userId: 1,

        ...overrides
    }
});

export const createGuestTestUser = () => ({
    user: null
});

/* =============================
   API EXPECTATIONS
============================= */

export const expectListingApiCalledWith = (mockApi, params = {}) => {
    expect(mockApi).toHaveBeenLastCalledWith(
        expect.objectContaining(params)
    );
};

/* =============================
   LOADED EMPTY STATE
============================= */

export const waitForEmptyListingState = async (
    screen,
    emptyText = /no events found/i
) => {
    await screen.findByText(emptyText);
};
