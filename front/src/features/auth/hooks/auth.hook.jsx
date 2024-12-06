import {
    createContext,
    useState,
    useEffect,
  } from "react";
  import { getApiClient } from "@/common/client/APIClient";
  import { useNavigate } from "react-router-dom";

  const AuthContext = createContext(undefined);

  export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const apiClient = getApiClient();
    const navigate = useNavigate();

    useEffect(() => {
      const checkAuthStatus = async () => {
        const sessionToken = localStorage.getItem("session");

        if (sessionToken) {
          try {
            const response = await apiClient.get("/sessions", {
              headers: {
                session: sessionToken,
              },
            });

            if (response.status === 200 && response.data?.data?.sessions) {
              console.log("Session token valid:", sessionToken);
              setIsAuthenticated(true);
            } else {
              console.log("Session token invalid, clearing localStorage");
              localStorage.removeItem("session");
              setIsAuthenticated(false);
            }
          } catch (error) {
            console.error("Error validating session token:", error);
            localStorage.removeItem("session");
            setIsAuthenticated(false);
          }
        } else {
          console.log("No session token found in localStorage");
          setIsAuthenticated(false);
        }

        setLoading(false);
      };

      checkAuthStatus();
    }, [apiClient]);

    const login = (sessionToken) => {
      console.log("User logged in, saving session token to localStorage");
      localStorage.setItem("session", sessionToken);
      setIsAuthenticated(true);
      navigate("/dashboard");
    };

    const logout = () => {
      console.log("User logged out, clearing session token from localStorage");
      localStorage.removeItem("session");
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
      const session_token = localStorage.getItem("session");
      setIsAuthenticated(!!session_token);
      setLoading(false);
    }, []);

    return { isAuthenticated, loading };
  };