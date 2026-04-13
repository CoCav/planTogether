import { useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import { getProfile, logOutUser } from "../api/authApi";
import { getToken, removeToken, setToken } from "../utils/token";

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {

        try {

            const response = await getProfile();
            setUser(response.data.user);
            return response.data.user
            
        } catch {
            removeToken();
            setUser(null);
        }
    };

    const login = async (token) => {
        setToken(token);
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