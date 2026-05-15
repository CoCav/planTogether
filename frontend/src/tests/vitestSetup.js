import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

/* ==================================================
   VITEST SETUP
   Applies global frontend test configuration

   Handles:
   - jest-dom matchers
   - automatic DOM cleanup
   - console warning/error suppression
================================================== */

beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => { });
    vi.spyOn(console, "warn").mockImplementation(() => { });
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});
