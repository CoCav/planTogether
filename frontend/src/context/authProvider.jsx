import { useEffect, useState } from "react";

import { AuthContext } from "./AuthContext";

import { logOutUser } from "../../api/auth/authApi";
import { getCurrentUserProfile } from "../../api/users/userApi";

import { getToken, removeToken, setToken } from "../../features/auth/authToken";

/* ==================================================
   AUTH PROVIDER
   Provides global authentication state and actions

   Handles:
   - user session initialization
   - login / logout actions
   - current user refresh
================================================== */

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /* =============================
       CURRENT USER FETCHING
    ============================= */

    // Fetches the currently authenticated user
    const fetchCurrentUser = async () => {
        try {
            const data = await getCurrentUserProfile();

            setUser(data.user);

            return data.user;
        } catch {
            removeToken();
            setUser(null);

            return null;
        }
    };

    /* =============================
       AUTH ACTIONS
    ============================= */

    // Logs in a user and initializes the session
    const login = async (token, remember = false) => {
        setToken(token, remember);

        await fetchCurrentUser();
    };

    // Logs out the current user
    const logout = async () => {
        try {
            await logOutUser();
        } catch (error) {
            console.error("Logout API error:", error);
        } finally {
            removeToken();
            setUser(null);
        }
    };

    // Refreshes the current authenticated user
    const refreshUser = async () => {
        await fetchCurrentUser();
    };

    /* =============================
       AUTH INITIALIZATION
    ============================= */

    // Restores the authenticated session from the stored token
    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = getToken();

                if (token) {
                    await fetchCurrentUser();
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
