import { createClient } from "@/app/utils/supabase/client";
import type { SessionT } from "@/app/types/auth";

/**
 * Fetches the current user session on the client side
 * @returns Promise<SessionT | null> - The session object or null if no session exists
 * @throws Error if session fetch fails
 */
export async function getSession(): Promise<SessionT | null> {
  try {
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error fetching session:", error);
      throw new Error("Failed to fetch user session");
    }

    if (!session) {
      return null;
    }

    return {
      user: session.user,
      expires_at: session.expires_at,
    };
  } catch (error) {
    console.error("Error in getUserSession:", error);
    throw new Error("Failed to get user session");
  }
}
