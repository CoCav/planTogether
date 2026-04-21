import { useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import { getProfile, logOutUser } from "../api/authApi";
import { getToken, removeToken, setToken } from "../features/auth/token";

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetches the authenticated upser's profile and updates the global auth state
    const fetchProfile = async () => {
        try {
            const response = await getProfile();
            setUser(response.data.user);
            return response.data.user
            
        } catch {
            removeToken();
            setUser(null);
            return null;
        }
    };

    // Logs in the user by storing the token and fetching profile data
    const login = async (token, remember = false) => {
        setToken(token, remember);
        await fetchProfile();
    };

    // Logs out the user and clears all authentification data
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

    // Refreshes the current user data (used after profile update)
    const refreshUser = async () => {
        await fetchProfile();
    };

    useEffect(() => {

        const initAuth = async () => {
            try {

                const token = getToken();
                if (token) {
                    await fetchProfile();
                }
 
            } catch (error) {
                console.log("Auth initialization error:", error)

            } finally {
                setLoading(false);
            }};
        initAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}