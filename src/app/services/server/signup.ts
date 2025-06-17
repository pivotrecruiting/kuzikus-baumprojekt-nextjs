"use server";

import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { appendMultipleErrorParams } from "@/app/utils/helpers/errors/append-multiple-error-params";
import { signUpSchema } from "@/app/schemas/zod/auth/signup-schema";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // Original URL für Redirects bewahren
  const returnTo = (formData.get("returnTo") as string) || "/registrieren";

  // Fehlersammlung initialisieren
  const errors: Record<string, string> = {};

  const rawData = {
    email: formData.get("email"),
    firstName: formData.get("first_name"),
    lastName: formData.get("last_name"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirm_password"),
    termsPrivacy: formData.get("terms_privacy") === "on",
    termsAgb: formData.get("terms_agb") === "on",
  };

  const validationResult = signUpSchema.safeParse(rawData);

  if (!validationResult.success) {
    validationResult.error.errors.forEach((error) => {
      const field = error.path[0] as string;
      let errorKey: string;

      // Mapping der Feldnamen zu Fehlerparameternamen
      switch (field) {
        case "firstName":
          errorKey = "firstNameError";
          break;
        case "lastName":
          errorKey = "lastNameError";
          break;
        case "email":
          errorKey = "emailError";
          break;
        case "password":
          errorKey = "passwordError";
          break;
        case "confirmPassword":
          errorKey = "confirmPasswordError";
          break;
        case "termsPrivacy":
          errorKey = "termsPrivacyError";
          break;
        case "termsAgb":
          errorKey = "termsAgbError";
          break;
        default:
          errorKey = `${field}Error`;
      }

      errors[errorKey] = error.message;
    });

    return redirect(appendMultipleErrorParams(returnTo, errors));
  }

  const { email, password, firstName, lastName, termsAgb, termsPrivacy } =
    validationResult.data;

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          termsPrivacy,
          termsAgb,
        },
      },
    });

    if (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("fetch failed") ||
          error.message.includes("network") ||
          error.message.includes("AuthRetryableFetchError")
        ) {
          errors.connectionError =
            "Keine Internetverbindung. Bitte überprüfen Sie Ihre Netzwerkverbindung und versuchen Sie es erneut.";
        } else {
          errors.authError = "Fehler beim Erstellen des Accounts.";
        }
      } else {
        errors.authError = "Fehler beim Erstellen des Accounts.";
      }
      return redirect(appendMultipleErrorParams(returnTo, errors));
    }
  } catch (error) {
    console.error("Failed signing up! Error: ", error);

    // Prüfen, ob es sich um einen Netzwerkfehler handelt
    if (error instanceof Error) {
      if (
        error.message.includes("fetch failed") ||
        error.message.includes("network") ||
        error.message.includes("AuthRetryableFetchError")
      ) {
        errors.connectionError =
          "Keine Internetverbindung. Bitte überprüfen Sie Ihre Netzwerkverbindung und versuchen Sie es erneut.";
      } else {
        errors.authError = "Fehler beim Erstellen des Accounts.";
      }
    } else {
      errors.authError = "Fehler beim Erstellen des Accounts.";
    }

    return redirect(appendMultipleErrorParams(returnTo, errors));
  }

  // Erfolgreiche Registrierung
  return redirect(
    appendMultipleErrorParams(returnTo, {
      success: "Account erstellt. Bitte verifizieren Sie Ihre E-Mail-Adresse.",
    })
  );
}
