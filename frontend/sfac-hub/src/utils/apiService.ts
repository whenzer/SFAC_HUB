// src/utils/apiService.ts

// --- Interfaces ---
interface RefreshResponse {
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

type FetchOptions = RequestInit & {
  headers?: HeadersInit;
};

// --- API Constants ---
const REFRESH_URL = "https://sfac-hub.fly.dev/api/user/token";
export const API_BASE_URL = "https://sfac-hub.fly.dev";

/**
 * Fetch wrapper with automatic token refresh (localStorage version)
 */
async function fetchWithRefresh(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const fullUrl = url.startsWith(API_BASE_URL) ? url : `${API_BASE_URL}${url}`;

  // --- 1. Prepare headers ---
  const headers: Record<string, string> = {
    ...(options.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : (options.headers as Record<string, string> | undefined) || {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // --- 2. Make the request ---
  let response = await fetch(fullUrl, { ...options, headers });

  // --- 3. Handle expired token ---
  if (response.status === 401 || response.status === 403) {
    if (!refreshToken) {
      console.error("No refresh token found. Forcing logout.");
      handleForceLogout();
      throw new Error("Session expired");
    }

    // --- Attempt refresh ---
    const refreshResponse = await fetch(REFRESH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const refreshData: RefreshResponse = await refreshResponse.json();

    if (refreshResponse.ok && refreshData.accessToken) {
      // Save new tokens
      localStorage.setItem("accessToken", refreshData.accessToken);
      if (refreshData.refreshToken) {
        localStorage.setItem("refreshToken", refreshData.refreshToken);
      }

      // Retry original request
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${refreshData.accessToken}`,
      };

      response = await fetch(fullUrl, { ...options, headers: retryHeaders });
      return response;
    }

    // --- If refresh failed ---
    console.error("Refresh token failed. Logging out.");
    handleForceLogout();
    throw new Error("Session expired");
  }

  return response;
}

// --- Utility: Clear storage and redirect ---
function handleForceLogout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userData");
  window.location.href = "/login?sessionExpired=true";
}

export default fetchWithRefresh;
