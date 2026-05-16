import { beforeEach, describe, expect, it } from "vitest";

import { getToken, removeToken, setToken } from "../../../features/auth/authToken";

/* ==================================================
   AUTH TOKEN TESTS
   Tests JWT token storage helpers

   Handles:
   - session storage persistence
   - local storage persistence
   - token retrieval priority
   - token cleanup
================================================== */

describe("authToken", () => {

    beforeEach(() => {
        sessionStorage.clear();
        localStorage.clear();
    });

    /* =============================
       TOKEN STORAGE
    ============================= */

    it("should store token in sessionStorage by default", () => {
        setToken("session-token");

        expect(sessionStorage.getItem("token")).toBe("session-token");
        expect(localStorage.getItem("token")).toBeNull();
    });

    it("should store token in localStorage when remember is true", () => {
        setToken("local-token", true);

        expect(localStorage.getItem("token")).toBe("local-token");
        expect(sessionStorage.getItem("token")).toBeNull();
    });

    /* =============================
       TOKEN RETRIEVAL
    ============================= */

    it("should get token from sessionStorage first", () => {
        sessionStorage.setItem("token", "session-token");
        localStorage.setItem("token", "local-token");

        expect(getToken()).toBe("session-token");
    });

    it("should fallback to localStorage when sessionStorage is empty", () => {
        localStorage.setItem("token", "local-token");

        expect(getToken()).toBe("local-token");
    });

    /* =============================
       TOKEN REMOVAL
    ============================= */

    it("should remove token from all storage locations", () => {
        sessionStorage.setItem("token", "session-token");
        localStorage.setItem("token", "local-token");

        removeToken();

        expect(sessionStorage.getItem("token")).toBeNull();
        expect(localStorage.getItem("token")).toBeNull();
    });
});
