import { useContext } from "react";
import { AuthContext } from "./authContext.jsx";

export function useAuth() {
  return useContext(AuthContext);
}