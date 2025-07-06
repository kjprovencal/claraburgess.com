/**
 * Utility functions for authentication and API requests
 */

/**
 * Checks if the current JWT token is expired
 * @returns true if token is expired or doesn't exist, false if valid
 */
export const isTokenExpired = (): boolean => {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    return true;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      console.log("⏰ Token expired at:", new Date(payload.exp * 1000));
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Failed to decode token:", error);
    return true;
  }
};

/**
 * Gets the token expiration time
 * @returns Date object of when token expires, or null if invalid
 */
export const getTokenExpiration = (): Date | null => {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error("❌ Failed to decode token:", error);
    return null;
  }
};

/**
 * Logs out the user and redirects to login
 */
export const forceLogout = () => {
  console.log("🔒 Token expired, forcing logout");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");

  // Redirect to login page
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

/**
 * Gets authentication headers for API requests
 * @returns Object with Authorization header if token exists
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");

  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Enhanced fetch wrapper that handles token expiration automatically
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise with the response
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  // Check if token is expired before making the request
  if (isTokenExpired()) {
    forceLogout();
    throw new Error("Token expired");
  }

  // Add auth headers
  const headers = {
    ...options.headers,
    ...getAuthHeaders(),
  };

  try {
    const response = await fetch(url, { ...options, headers });

    // If we get a 401, the token is invalid/expired
    if (response.status === 401) {
      console.log("🔒 Received 401, token invalid - forcing logout");
      forceLogout();
      throw new Error("Authentication failed");
    }

    return response;
  } catch (error) {
    // If it's a network error, don't logout (might be server down)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw error;
    }

    // For other errors, check if token is expired
    if (isTokenExpired()) {
      forceLogout();
    }

    throw error;
  }
};
