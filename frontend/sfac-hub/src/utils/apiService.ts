// Define interfaces for expected data structures for better type safety
interface RefreshResponse {
    accessToken?: string;
    refreshToken?: string;
    message?: string;
}

// Custom type for Fetch options to allow for easier header manipulation
type FetchOptions = RequestInit & { 
    // HeadersInit is the built-in fetch type for headers (string[][] | Record<string, string> | Headers)
    headers?: HeadersInit; 
};

// --- API Constants ---
const REFRESH_URL: string = 'https://sfac-hub.onrender.com/api/user/token';
export const API_BASE_URL: string = 'https://sfac-hub.onrender.com';

/**
 * Custom fetch wrapper to handle token expiration and automatic token refresh.
 * It detects a 401 (Unauthorized) status, uses the refresh token to get a new
 * access token, and retries the original request.
 * * @param url The API endpoint (can be relative or absolute).
 * @param options The standard RequestInit options for fetch.
 * @returns A Promise that resolves to the Response object.
 */
async function fetchWithRefresh(url: string, options: FetchOptions = {}): Promise<Response> {
    const accessToken: string | null = localStorage.getItem('accessToken');
    const refreshToken: string | null = localStorage.getItem('refreshToken');
    const fullUrl: string = url.startsWith(API_BASE_URL) ? url : `${API_BASE_URL}${url}`;

    // --- FIX: Resolve Header Type Conflict ---
    // 1. Initialize headers as a Record<string, string> for easy manipulation
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        // 2. Safely spread existing headers by asserting their type to satisfy the compiler
        ...(options.headers as Record<string, string> || {}),
    };
    
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    let response: Response = await fetch(fullUrl, { ...options, headers });

    // 2. Check for expired token (401)
    if (response.status === 401 && refreshToken) {
        
        console.warn("Access token expired. Attempting refresh...");
        
        // --- ATTEMPT TOKEN REFRESH ---
        const refreshResponse: Response = await fetch(REFRESH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
        
        const refreshData: RefreshResponse = await refreshResponse.json();

        if (refreshResponse.ok && refreshData.accessToken) {
            // New token received!
            const newAccessToken: string = refreshData.accessToken;
            localStorage.setItem('accessToken', newAccessToken);

            if (refreshData.refreshToken) {
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
        
        // If Refresh Failed (token was invalid/expired)
        console.error("Refresh token failed. Forcing logout.");
        
        // Force client logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        window.location.href = '/login?sessionExpired=true';
        
        throw new Error("Session expired.");
    }

    // 3. Return the successful response or the original failed (non-401) response
    return response;
}

export default fetchWithRefresh;