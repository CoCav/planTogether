/*
This file is responsible for:
 * - store the JWT token in localStorage
 * - retrieve the token when needed
 * - remove the token on logout
 */

const TOKEN_KEY = "token";

// Retrieves the current authentication token from localStorage
export const getToken = () => localStorage.getItem(TOKEN_KEY);

// Stores the authentication token in localStorage
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

// Removes the token (used when logging out)
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);