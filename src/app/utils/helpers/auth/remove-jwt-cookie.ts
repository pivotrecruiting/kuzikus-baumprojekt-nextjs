import { cookies } from "next/headers";

export async function removeJwtCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
}
