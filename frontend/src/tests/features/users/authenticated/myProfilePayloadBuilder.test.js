import { describe, expect, it } from "vitest";

import {
    buildCurrentUserProfileFormData,
    buildCurrentUserProfilePayload
} from "../../../../features/users/authenticated/myProfilePayloadBuilder";

/* ==================================================
   MY PROFILE PAYLOAD BUILDER TESTS
   Tests authenticated user profile payload builders

   Handles:
   - profile payload creation
   - avatar file inclusion
   - avatar unchanged omission
   - avatar removal payload
   - FormData payload creation

   Notes:
   - backend clears avatar when avatar is provided as an empty value
================================================== */

describe("myProfilePayloadBuilder", () => {

    /* =============================
       TEST DATA
    ============================= */

    const createProfileValues = (overrides = {}) => ({
        name: "John",
        email: "john@example.com",
        avatar: null,
        currentAvatar: "/uploads/users/avatar.png",
        ...overrides
    });

    /* =============================
       PROFILE PAYLOAD
    ============================= */

    it("should build current user profile payload", () => {
        const payload = buildCurrentUserProfilePayload(
            createProfileValues()
        );

        expect(payload).toEqual({
            name: "John",
            email: "john@example.com",
            avatar: undefined
        });
    });

    it("should include avatar file when provided", () => {
        const file = new File(["avatar"], "avatar.png", {
            type: "image/png"
        });

        const payload = buildCurrentUserProfilePayload(
            createProfileValues({
                avatar: file
            })
        );

        expect(payload.avatar).toBe(file);
    });

    it("should omit avatar when existing avatar is unchanged", () => {
        const payload = buildCurrentUserProfilePayload(
            createProfileValues({
                avatar: null,
                currentAvatar: "/uploads/users/avatar.png"
            })
        );

        expect(payload.avatar).toBeUndefined();
    });

    it("should set avatar to empty string when avatar is removed", () => {
        const payload = buildCurrentUserProfilePayload(
            createProfileValues({
                avatar: null,
                currentAvatar: null
            })
        );

        expect(payload.avatar).toBe("");
    });

    /* =============================
       FORM DATA PAYLOAD
    ============================= */

    it("should build FormData from profile payload", () => {
        const formData = buildCurrentUserProfileFormData(createProfileValues());

        expect(formData.get("name")).toBe("John");
        expect(formData.get("email")).toBe("john@example.com");
    });

    it("should skip avatar in FormData when avatar is unchanged", () => {
        const formData = buildCurrentUserProfileFormData(
            createProfileValues({
                avatar: null,
                currentAvatar: "/uploads/users/avatar.png"
            })
        );

        expect(formData.has("avatar")).toBe(false);
    });

    it("should append avatar file to FormData when provided", () => {
        const file = new File(["avatar"], "avatar.png", {
            type: "image/png"
        });

        const formData = buildCurrentUserProfileFormData(
            createProfileValues({
                avatar: file
            })
        );

        expect(formData.get("avatar")).toBe(file);
    });

    it("should append empty avatar value to FormData when avatar is removed", () => {
        const formData = buildCurrentUserProfileFormData(
            createProfileValues({
                avatar: null,
                currentAvatar: null
            })
        );

        expect(formData.get("avatar")).toBe("");
    });
});
