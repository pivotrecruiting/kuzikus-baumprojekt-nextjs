import { createClient } from "@/app/utils/supabase/server";
import { getSession } from "@/app/services/auth/server/session";
import type { ExtendedUserT, UserRolesObjT } from "@/app/types/users";

/**
 * Fetches the extended user object of the currently authenticated user including their roles
 * @returns Promise<ExtendedUserT | null> - The extended user object or null if not found
 * @throws Error if database query fails or user is not authenticated
 */
export async function getExtendedUser(): Promise<ExtendedUserT | null> {
  try {
    const supabase = await createClient();
    const session = await getSession();

    if (!session?.user) {
      return null;
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select(
        `
        *,
        user_roles (
          role:roles (
            id,
            name
          )
        ),
        profile_images (
          id,
          url,
          file_name,
          file_type,
          file_size,
          created_at
        )
      `
      )
      .eq("id", session.user.id)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
      throw new Error("Failed to fetch user data");
    }

    if (!user) {
      return null;
    }

    // Transform the data to match ExtendedUserT type
    const extendedUser: ExtendedUserT = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      termsPrivacy: user.terms_privacy,
      termsAgb: user.terms_agb,
      roles: (user.user_roles as UserRolesObjT[]).map((ur: UserRolesObjT) => ({
        id: ur.role.id,
        name: ur.role.name,
      })),
      profileImage: user.profile_images?.[0]
        ? {
            id: user.profile_images[0].id,
            url: user.profile_images[0].url,
            fileName: user.profile_images[0].file_name,
            fileType: user.profile_images[0].file_type,
            fileSize: user.profile_images[0].file_size,
            createdAt: user.profile_images[0].created_at,
          }
        : null,
    };

    return extendedUser;
  } catch (error) {
    console.error("Error in getExtendedUser:", error);
    throw new Error("Failed to fetch extended user data");
  }
}
