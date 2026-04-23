import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { beforeEach, afterEach, vi } from "vitest";

// ----------------------
// Global test setup
// ----------------------

beforeEach(() => {
    // Silence console noise during tests
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
    // Cleanup DOM
    cleanup();

    // Restore mocks
    vi.restoreAllMocks();
});