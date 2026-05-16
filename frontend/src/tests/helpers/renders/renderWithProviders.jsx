import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AuthContext } from "../../../context/auth/AuthContext";

import { createAuthContextValue } from "../../factories/auth/authFactory";

/* ==================================================
   RENDER WITH PROVIDERS HELPER

   Handles:
   - React Testing Library rendering
   - MemoryRouter wrapping
   - AuthContext wrapping

   Notes:
   - avoids AuthProvider side effects during tests
   - accepts auth overrides for protected/public scenarios
   - accepts initial route entries for router tests
================================================== */

/* =============================
   RENDER HELPERS
============================= */

// Render UI with router and auth providers
export const renderWithProviders = (ui, {
    route = "/",
    auth = {},
    router = true
} = {}
) => {

    const authValue = createAuthContextValue(auth);

    const tree = (
        <AuthContext.Provider value={authValue}>
            {ui}
        </AuthContext.Provider>
    );

    return render(
        router ? (
            <MemoryRouter initialEntries={[route]}>
                {tree}
            </MemoryRouter>
        ) : (
            tree
        )
    );
};
