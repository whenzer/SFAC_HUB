// src/utils/apiService.ts

// Define interfaces for expected data structures for better type safety
interface RefreshResponse {
    accessToken?: string;
    refreshToken?: string;
    message?: string;
}

// Custom type for Fetch options
type FetchOptions = RequestInit & { 
    headers?: HeadersInit; 
};

// --- API Constants ---
const REFRESH_URL: string = 'https://sfac-hub.onrender.com/api/user/token';
export const API_BASE_URL: string = 'https://sfac-hub.onrender.com';

async function fetchWithRefresh(url: string, options: FetchOptions = {}): Promise<Response> {
    const accessToken: string | null = localStorage.getItem('accessToken');
    const refreshToken: string | null = localStorage.getItem('refreshToken');
    const fullUrl: string = url.startsWith(API_BASE_URL) ? url : `${API_BASE_URL}${url}`;

    // 1. Prepare Initial Headers
    const headers: Record<string, string> = options.headers ? options.headers as Record<string, string> : {};
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // 2. Make Initial Request
    let response: Response = await fetch(fullUrl, { ...options, headers });

    // 3. Handle Token Expiration (401)
    if (response.status === 401) {
        // If NO Refresh Token exists, we can't proceed. Force client logout.
        if (!refreshToken) {
            console.error("Access Token expired, but no Refresh Token found. Forcing logout.");
            // Force client logout and redirect
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login?sessionExpired=true';
            throw new Error("Session expired.");
        }

        // --- ATTEMPT TOKEN REFRESH ---
        const refreshResponse: Response = await fetch(REFRESH_URL, {
            method: 'POST',
            // CRITICAL: Ensure Content-Type is set for the server to read the body
            headers: {
                'Content-Type': 'application/json',
            },
            // 🛑 FIX: Use the correct key 'refreshToken' for the backend
            body: JSON.stringify({ refreshToken: refreshToken }), 
        });

        const refreshData: RefreshResponse = await refreshResponse.json();

        // If Refresh Succeeded
        if (refreshResponse.ok && refreshData.accessToken) {
            const newAccessToken: string = refreshData.accessToken;
            localStorage.setItem('accessToken', newAccessToken);

            if (refreshData.refreshToken) {
                // If the server issues a new Refresh Token (Rolling refresh), save it
                localStorage.setItem('refreshToken', refreshData.refreshToken);
            }

            // --- RETRY ORIGINAL REQUEST ---
            console.log("Token refreshed successfully. Retrying original request.");
            
            // Update the headers for the retry
            const retryHeaders: Record<string, string> = {
                ...headers, 
                'Authorization': `Bearer ${newAccessToken}`,
            };

            response = await fetch(fullUrl, { ...options, headers: retryHeaders });
            
            if (response.ok) {
                return response;
            }
        } 
        
        // If Refresh Failed (token was invalid/expired, 403, 500, etc.)
        console.error("Refresh token failed. Forcing client logout.");
        
        // Final Force Logout (Deletes tokens and redirects)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        window.location.href = '/login?sessionExpired=true';
        
        throw new Error("Session expired.");
    }

    // 4. Return the successful response or the original failed (non-401) response
    return response;
}

export default fetchWithRefresh;