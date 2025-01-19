import React, { createContext, useState, useEffect } from "react";
import { storageService } from "../services/storageService";
import { api } from "../api/lubeLogger";
import { Box, CircularProgress } from "@mui/material";

export const AuthContext = createContext({
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const credentials = await storageService.getCredentials();
      if (credentials) {
        const { username, password } = credentials;
        const isValid = await api.validateCredentials(username, password);
        setIsAuthenticated(isValid);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const isValid = await api.validateCredentials(username, password);
      if (isValid) {
        await storageService.saveCredentials(username, password);
        setIsAuthenticated(true);
      }
      return isValid;
    } catch (error) {
      console.error("Login error:", error);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await storageService.clearCredentials();
      api.clearAuth();
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
