/**
 * Get the base URL based on environment and current hostname
 * Supports both main domain and app subdomain
 */
export const getBaseUrl = (hostname?: string) => {
  const env = process.env.NODE_ENV;

  // Server-side: use provided hostname or fallback
  if (typeof window === "undefined") {
    if (hostname) {
      const protocol = env === "production" ? "https" : "http";
      return `${protocol}://${hostname}`;
    }
    // Fallback for server-side without hostname
    return env === "production"
      ? "https://your-domain.de" //TODO: Add your domain
      : "http://localhost:3000";
  }

  // Client-side: use window.location
  return `${window.location.protocol}//${window.location.host}`;
};
