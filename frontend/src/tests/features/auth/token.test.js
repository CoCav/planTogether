import { beforeEach, describe, expect, it } from "vitest";
import { getToken, removeToken, setToken } from "../../../features/auth/token";

/* ==================================================
   AUTH TOKEN TESTS
   Tests JWT token storage helpers
================================================== */

describe("token utils", () => {
    beforeEach(() => {
        sessionStorage.clear();
        localStorage.clear();
    });

    it("stores token in sessionStorage by default", () => {
        setToken("session-token");

        expect(sessionStorage.getItem("token")).toBe("session-token");
        expect(localStorage.getItem("token")).toBeNull();
    });

    it("stores token in localStorage when remember is true", () => {
        setToken("local-token", true);

        expect(localStorage.getItem("token")).toBe("local-token");
        expect(sessionStorage.getItem("token")).toBeNull();
    });

    it("gets token from sessionStorage first", () => {
        sessionStorage.setItem("token", "session-token");
        localStorage.setItem("token", "local-token");

        expect(getToken()).toBe("session-token");
    });

    it("falls back to localStorage when sessionStorage has no token", () => {
        localStorage.setItem("token", "local-token");

        expect(getToken()).toBe("local-token");
    });

    it("removes token from both storages", () => {
        sessionStorage.setItem("token", "session-token");
        localStorage.setItem("token", "local-token");

        removeToken();

        expect(sessionStorage.getItem("token")).toBeNull();
        expect(localStorage.getItem("token")).toBeNull();
    });
});
