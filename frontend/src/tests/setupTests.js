import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

/* ==================================================
   TEST SETUP
   Applies global test configuration

   Handles:
   - jest-dom matchers
   - DOM cleanup
   - console noise suppression
================================================== */

beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => { });
    vi.spyOn(console, "warn").mockImplementation(() => { });
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});
