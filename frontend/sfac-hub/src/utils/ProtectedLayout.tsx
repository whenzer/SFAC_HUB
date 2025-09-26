import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import fetchWithRefresh, { API_BASE_URL } from "../utils/apiService";

// Define expected user data structure
interface UserData {
  firstname?: string;
  middlename?: string;
  lastname?: string;
  role?: string;
  [key: string]: any;
}

interface ProtectedLayoutProps {
  endpoint: string; // API endpoint, e.g. "/protected/dashboard"
  children: (props: {
    user: UserData | null;
    isLoading: boolean;
    logout: () => Promise<void>;
  }) => React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ endpoint, children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();

  // --- Logout handler ---
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/api/user/logout`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: refreshToken }),
        });
      } catch (err) {
        console.error("Server-side logout failed:", err);
      }
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");

    navigate("/login");
  }, [navigate]);

  // --- Auth + fetch user ---
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken && !refreshToken) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetchWithRefresh(endpoint, { method: "GET" });

        if (!response.ok) {
          console.error(`${endpoint} fetch failed: ${response.status}`);
          logout();
          return;
        }

        const data = await response.json();
        const user: UserData = data.user;

        if (user) {
          localStorage.setItem("userData", JSON.stringify(user));
          setUser(user);
        } else {
          console.error("No user data returned");
          logout();
        }
      } catch (err) {
        console.error("Fetch error/session expired:", err);
        if (!navigator.onLine) {
          alert("Network error. Please check your connection.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [endpoint, logout, navigate]);

  return <>{children({ user, isLoading, logout })}</>;
};

export default ProtectedLayout;