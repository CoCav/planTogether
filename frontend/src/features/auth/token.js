/* ==================================================
   AUTH TOKEN
   Handles storage and retrieval of the JWT token

   Uses:
   - sessionStorage (default)
   - localStorage (when "Remember me" is enabled)
================================================== */

const TOKEN_KEY = "token";

/* =========================
   Token retrieval
   Returns token from storage if available
========================= */

export const getToken = () => {
    return (
        sessionStorage.getItem(TOKEN_KEY) ||
        localStorage.getItem(TOKEN_KEY)
    );
};

/* =========================
   Token storage
   Stores token based on persistence choice
========================= */

export const setToken = (token, remember = false) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
};

/* =========================
   Token removal
   Clears token from all storages
========================= */

export const removeToken = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
};
