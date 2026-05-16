import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";

import { afterEach, beforeEach, vi } from "vitest";

/* ==================================================
   TEST SETUP
   Applies global frontend test configuration

   Handles:
   - jest-dom matchers
   - automatic DOM cleanup
   - console warning suppression
   - console error suppression

   Notes:
   - loaded globally through Vitest setupFiles
================================================== */

/* =============================
   GLOBAL MOCKS
============================= */

beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => { });
    vi.spyOn(console, "warn").mockImplementation(() => { });
});

/* =============================
   CLEANUP
============================= */

afterEach(() => {
    cleanup();

    vi.restoreAllMocks();
});
