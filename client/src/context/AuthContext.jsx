import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("sweety_token")
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("sweety_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });

    const { token: newToken, user: userData } = response.data;

    localStorage.setItem("sweety_token", newToken);
    localStorage.setItem("sweety_user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);

    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("sweety_token");
    localStorage.removeItem("sweety_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated: Boolean(token), login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
