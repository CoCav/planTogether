import { describe, it, expect, beforeEach } from "vitest";
import { getToken, setToken, removeToken } from "../../../features/auth/token";

describe("token utils", () => {
    beforeEach(() => {
        sessionStorage.clear();
        localStorage.clear();
    });

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

    it("should get token from sessionStorage first", () => {
        sessionStorage.setItem("token", "session-token");
        localStorage.setItem("token", "local-token");

        expect(getToken()).toBe("session-token");
    });

    it("should fallback to localStorage when sessionStorage has no token", () => {
        localStorage.setItem("token", "local-token");

        expect(getToken()).toBe("local-token");
    });

    it("should remove token from both storages", () => {
        sessionStorage.setItem("token", "session-token");
        localStorage.setItem("token", "local-token");

        removeToken();

        expect(sessionStorage.getItem("token")).toBeNull();
        expect(localStorage.getItem("token")).toBeNull();
    });
});