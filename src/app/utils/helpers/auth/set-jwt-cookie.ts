import { cookies } from "next/headers";

export async function setJwtCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 Tage
  });
}
