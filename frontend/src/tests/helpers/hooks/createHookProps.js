import { vi } from "vitest";

/* ==================================================
   HOOK PROP HELPERS

   Handles:
   - common hook callback props
   - mutation hook props
   - loading/message/error state handlers

   Notes:
   - shared across hook tests
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   CALLBACK PROPS
============================= */

// Create common callback props for hooks
export const createHookCallbacks = (overrides = {}) => ({
    loadData: vi.fn(),
    resetPage: vi.fn(),

    setMessage: vi.fn(),
    setError: vi.fn(),

    ...overrides
});

/* =============================
   MUTATION HOOK PROPS
============================= */

// Create common mutation hook props
export const createMutationHookProps = (overrides = {}) => ({
    eventId: 1,

    ...createHookCallbacks(),

    ...overrides
});

/* =============================
   MEMBERSHIP HOOK PROPS
============================= */

// Create common membership action hook props
export const createMembershipActionHookProps = (overrides = {}) => ({
    ...createHookCallbacks(),

    getRoleByEventId: vi.fn(),

    ...overrides
});
