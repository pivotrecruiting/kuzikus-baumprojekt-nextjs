import { getBaseUrl } from "../get-base-url";

export const ERROR_PARAMS = [
  "emailError",
  "passwordError",
  "firstNameError",
  "lastNameError",
  "authError",
  "connectionError",
] as const;

/**
 * Append multiple error parameters to URL while preserving current domain/subdomain
 */
export function appendMultipleErrorParams(
  url: string,
  errors: Record<string, string>
): string {
  let urlObj: URL;

  // Handle absolute vs relative URLs
  if (url.startsWith("http")) {
    urlObj = new URL(url);
  } else {
    // For relative URLs, preserve current domain context
    if (typeof window !== "undefined") {
      // Client-side: use current location
      urlObj = new URL(url, window.location.origin);
    } else {
      // Server-side: fallback to base URL (might need hostname from headers)
      urlObj = new URL(url, getBaseUrl());
    }
  }

  // Remove existing error parameters
  ERROR_PARAMS.forEach((errorParam) => {
    urlObj.searchParams.delete(errorParam);
  });

  // Add new error parameters
  Object.entries(errors).forEach(([param, value]) => {
    if (value) {
      urlObj.searchParams.set(param, value);
    }
  });

  return `${urlObj.pathname}${urlObj.search}`;
}
