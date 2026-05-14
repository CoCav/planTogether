/* ==================================================
   AUTH TOKEN
   Handles storage and retrieval of the JWT token

   Uses:
   - sessionStorage by default
   - localStorage when "Remember me" is enabled
================================================== */

const TOKEN_KEY = "token";

/* =============================
   TOKEN RETRIEVAL
============================= */

// Returns the stored token if available
export const getToken = () => {
    return (
        sessionStorage.getItem(TOKEN_KEY) ||
        localStorage.getItem(TOKEN_KEY)
    );
};

/* =============================
   TOKEN STORAGE
============================= */

// Stores the token based on the selected persistence mode
export const setToken = (token, remember = false) => {
    removeToken();

    const storage = remember ? localStorage : sessionStorage;

    storage.setItem(TOKEN_KEY, token);
};

/* =============================
   TOKEN REMOVAL
============================= */

// Clears the token from all storage locations
export const removeToken = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
};
