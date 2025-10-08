import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import fetchWithRefresh, { API_BASE_URL } from "../utils/apiService";

interface UserData {
  firstname?: string;
  middlename?: string;
  lastname?: string;
  role?: string;
  [key: string]: any;
}

interface ProtectedLayoutProps {
  endpoint: string;
  children: (props: {
    user: UserData | null;
    isLoading: boolean;
    logout: () => Promise<void>;
    extraData?: Record<string, any>; // 👈 optional values
    refetch: () => Promise<void>; // 👈 allow pages to refresh data without closing modals
  }) => React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ endpoint, children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [extraData, setExtraData] = useState<Record<string, any> | undefined>();
  const navigate = useNavigate();

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

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetchWithRefresh(endpoint, { method: "GET" });
      if (!response.ok) {
        console.error(`${endpoint} fetch failed: ${response.status}`);
        logout();
        return;
      }

      const data = await response.json();
      const { user, ...rest } = data; // 👈 separate user + extra values

      if (user) {
        localStorage.setItem("userData", JSON.stringify(user));
        setUser(user);
        setExtraData(rest); // 👈 keep optional values like products
      } else {
        console.error("No user data returned");
        logout();
      }
    } catch (err) {
      console.error("Fetch error/session expired:", err);
      if (!navigator.onLine) {
        alert("Network error. Please check your connection.");
      }
    }
  }, [endpoint, logout]);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (!accessToken && !refreshToken) {
      navigate("/login");
      return;
    }
    (async () => {
      setIsLoading(true);
      await fetchUser();
      setIsLoading(false);
    })();
  }, [endpoint, logout, navigate, fetchUser]);

  const refetch = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return <>{children({ user, isLoading, logout, extraData, refetch })}</>; 
};

export default ProtectedLayout;