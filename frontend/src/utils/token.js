/*
This file is responsible for:
 * - the JWT token
*/

// Key used to store the authenticated token
const TOKEN_KEY = "token";

// Retrieves the token from storage :
//  1. sessionStorage (temporary session)
// 2. localStorage (persistent session if "Remember me" is enabled)
export const getToken = () => {  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY); };

// Stores the token based on user preference
export const setToken = (token, remember = false) => { 
    const storage = remember ? localStorage : sessionStorage; 
    storage.setItem(TOKEN_KEY, token); 
};

// Removes the token from both storages
export const removeToken = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
};