"use server";

import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function signout() {
  const supabase = await createClient();
  const cookieStore = await cookies();

  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Fehler beim Ausloggen:", error);
    }

    // Remove JWT cookie
    cookieStore.delete("access_token");
  } catch (error) {
    console.error("Fehler beim Ausloggen:", error);
  }

  // Redirect to login page
  redirect("/login");
}
