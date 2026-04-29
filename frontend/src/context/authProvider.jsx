import { useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import { getProfile, logOutUser } from "../api/authApi";
import { getToken, removeToken, setToken } from "../features/auth/token";

/* ==================================================
   AUTH PROVIDER
   Provides global authentication state to the app

   Handles:
   - user session initialization
   - login / logout actions
   - profile refresh
================================================== */

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /* =========================
       Profile fetching
       Loads the authenticated user's profile
    ========================= */

    const fetchProfile = async () => {
        try {
            const response = await getProfile();
            setUser(response.data.user);

            return response.data.user;
        } catch {
            removeToken();
            setUser(null);

            return null;
        }
    };

    /* =========================
       Auth actions
       Login, logout and user refresh helpers
    ========================= */

    const login = async (token, remember = false) => {
        setToken(token, remember);
        await fetchProfile();
    };

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

    const refreshUser = async () => {
        await fetchProfile();
    };

    /* =========================
       Auth initialization
       Restores user session from stored token
    ========================= */

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = getToken();

                if (token) {
                    await fetchProfile();
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
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}