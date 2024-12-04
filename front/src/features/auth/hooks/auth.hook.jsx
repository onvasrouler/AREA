import React, {
    createContext,
    useContext,
    useState,
    useEffect,
  } from "react";
  import { getApiClient } from "@/common/api/client";
  import { accessTokenKey } from "@/common/constants/auth";
  import { useNavigate } from "react-router-dom";

  const AuthContext = createContext(undefined);

  export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const apiClient = getApiClient();
    const navigate = useNavigate();

    useEffect(() => {
      const checkAuthStatus = async () => {
        const token = localStorage.getItem(accessTokenKey);

        if (token) {
          try {
            // Change to use the /session endpoint, add a comparison to find if the given token is in the list of valid tokens returned by the /session endpoint
            const response = await apiClient.get("/auth/validate-token", {
              Authorization: `Bearer ${token}`,
            });
            console.log("Token found in localStorage:", token);
            console.log("Validation response:", response);

            if (response.ok) {
              console.log("Token is valid");
              setIsAuthenticated(true);
            } else {
              console.log("Token is invalid, clearing localStorage");
              localStorage.removeItem(accessTokenKey);
              setIsAuthenticated(false);
            }
          } catch {
            localStorage.removeItem(accessTokenKey);
            setIsAuthenticated(false);
          }
        }

        setLoading(false);
        console.log("Authentication check complete, loading set to false");
      };

      checkAuthStatus();
    }, []);

    const login = () => {
      console.log("User logged in");
      setIsAuthenticated(true);
    };

    const logout = () => {
      console.log("User logged out, clearing token from localStorage");
      localStorage.removeItem(accessTokenKey);
      setIsAuthenticated(false);
      navigate("/login");
    };

    return (
      <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };

  export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
      setLoading(false);
    }, []);

    return { isAuthenticated, loading };
  };