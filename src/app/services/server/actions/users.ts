import { createClient } from "@/app/utils/supabase/server";
import type { UserRoleT } from "@/app/types/users";

/**
 * Fetches user roles from Supabase by joining user_roles and roles tables
 */
export async function getUserRoles(
  userId: string
): Promise<UserRoleT[] | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select(
        `
        roles (
          id,
          name
        )
      `
      )
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user roles:", error);
      return null;
    }

    // Transform the nested structure to flat array
    const userRoles: UserRoleT[] =
      data
        ?.map((item) => item.roles)
        .filter((role) => role !== null)
        .map((role) => ({
          // @ts-expect-error - Supabase joined query type inference issue
          id: role.id,
          // @ts-expect-error - Supabase joined query type inference issue
          name: role.name,
        })) || [];

    return userRoles;
  } catch (error) {
    console.error("Unexpected error fetching user roles:", error);
    return null;
  }
}
