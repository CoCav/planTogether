import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";

import { AuthContext } from "../../../../context/auth/AuthContext";
import { useAuth } from "../../../../features/auth/hooks/useAuth";

import { createAuthContextValue } from "../../../factories/auth/authFactory";

/* ==================================================
   USE AUTH TESTS
   Tests authentication context hook

   Handles:
   - auth context value access
   - authenticated user state
   - auth actions exposure

   Notes:
   - uses reusable auth context factory
================================================== */

describe("useAuth", () => {

    /* =============================
       AUTH CONTEXT
    ============================= */

    it("should return the current auth context value", () => {
        const authValue = createAuthContextValue();

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
