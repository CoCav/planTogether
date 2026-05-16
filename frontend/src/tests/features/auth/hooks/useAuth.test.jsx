import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";

import { AuthContext } from "../../../../context/auth/AuthContext";
import { useAuth } from "../../../../features/auth/hooks/useAuth";

/* ==================================================
   USE AUTH TESTS
   Tests authentication context hook

   Handles:
   - auth context value access
   - authenticated user state
   - auth actions exposure
================================================== */

describe("useAuth", () => {

    it("should return the current auth context value", () => {
        const authValue = {
            user: {
                userId: 1,
                name: "John Doe",
                email: "john@test.com"
            },
            loading: false,
            login: () => { },
            logout: () => { },
            refreshUser: () => { }
        };

        const wrapper = ({ children }) => (
            <AuthContext.Provider value={authValue}>
                {children}
            </AuthContext.Provider>
        );

        const { result } = renderHook(() => useAuth(), {
            wrapper
        });

        expect(result.current).toBe(authValue);
    });
});
