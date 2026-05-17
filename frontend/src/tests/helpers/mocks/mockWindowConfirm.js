import { vi } from "vitest";

/* ==================================================
   WINDOW CONFIRM MOCK HELPERS

   Handles:
   - accepted confirmation dialogs
   - cancelled confirmation dialogs
   - reusable window.confirm mocking

   Notes:
   - shared across destructive action tests
   - useful for delete, leave and ownership transfer flows
================================================== */

/* =============================
   CONFIRMATION MOCKS
============================= */

// Mock window.confirm as accepted
export const mockConfirmAccepted = () => {
    return vi.spyOn(window, "confirm").mockReturnValue(true);
};

// Mock window.confirm as cancelled
export const mockConfirmCancelled = () => {
    return vi.spyOn(window, "confirm").mockReturnValue(false);
};
