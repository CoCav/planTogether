import { describe, expect, it } from "vitest";

import {
    getLoginRedirectPath,
    getRegisterRedirectPath
} from "../../../features/auth/authRedirects";

/* ==================================================
   AUTH REDIRECTS TESTS
   Tests authentication redirect path helpers

   Handles:
   - login redirect path restoration
   - register redirect path restoration
   - fallback redirect paths
   - query param preservation
   - stale pagination cleanup
================================================== */

describe("authRedirects", () => {

    /* =============================
       LOGIN REDIRECT
    ============================= */

    it("returns fallback path when login redirect location is missing", () => {
        expect(getLoginRedirectPath(undefined)).toBe("/events");
    });

    it("supports custom login fallback path", () => {
        expect(getLoginRedirectPath(undefined, "/")).toBe("/");
    });

    it("restores pathname and query params after login", () => {
        expect(
            getLoginRedirectPath({
                pathname: "/my-events",
                search: "?view=joined&page=2"
            })
        ).toBe("/my-events?view=joined&page=2");
    });

    /* =============================
       REGISTER REDIRECT
    ============================= */

    it("returns fallback path when register redirect location is missing", () => {
        expect(getRegisterRedirectPath(undefined)).toBe("/events");
    });

    it("supports custom register fallback path", () => {
        expect(getRegisterRedirectPath(undefined, "/")).toBe("/");
    });

    it("removes stale page param after registration", () => {
        expect(
            getRegisterRedirectPath({
                pathname: "/my-events",
                search: "?view=joined&page=2"
            })
        ).toBe("/my-events?view=joined");
    });

    it("preserves other query params after removing stale page param", () => {
        expect(
            getRegisterRedirectPath({
                pathname: "/events",
                search: "?type=gaming&order=desc&page=3"
            })
        ).toBe("/events?type=gaming&order=desc");
    });

    it("returns pathname when no query params exist", () => {
        expect(
            getRegisterRedirectPath({
                pathname: "/profile",
                search: ""
            })
        ).toBe("/profile");
    });
});
