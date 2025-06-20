"use server";

import { signinSchema } from "@/app/schemas/zod/auth/signin-schema";
import { appendMultipleErrorParams } from "@/app/utils/helpers/errors/append-multiple-error-params";
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { SignJWT } from "jose";
import { setJwtCookie } from "@/app/utils/helpers/auth/set-jwt-cookie";
import { getUserRoles } from "./actions/users";

export async function signin(formData: FormData) {
  const supabase = await createClient();
  const returnTo = (formData.get("returnTo") as string) || "/login";
  const errors: Record<string, string> = {};

  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validationResult = signinSchema.safeParse(rawData);

  if (!rawData.email) errors.emailError = "E-Mail ist erforderlich";
  if (!rawData.password) errors.passwordError = "Passwort ist erforderlich";

  if (!validationResult.success) {
    validationResult.error.errors.forEach((error) => {
      const field = error.path[0] as string;
      errors[`${field}Error`] = error.message;
    });
    return redirect(appendMultipleErrorParams(returnTo, errors));
  }

  const { email, password } = validationResult.data;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      errors.authError = "Falsche E-Mail oder Passwort";
      return redirect(appendMultipleErrorParams(returnTo, errors));
    }

    const user = data.session.user;

    const userRoles = await getUserRoles(user.id);

    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      roles: userRoles,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!));

    await setJwtCookie(token);
  } catch (error) {
    console.error("Fehler beim Login:", error);
    errors.authError = "Fehler beim Einloggen";
    return redirect(appendMultipleErrorParams(returnTo, errors));
  }

  return redirect("/");
}
