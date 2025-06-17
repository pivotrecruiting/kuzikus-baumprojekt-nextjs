"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { InputWithLabel } from "@/app/components/ui/input";
import { ErrorMessage } from "../components/error-message";
import { SuccessMessage } from "../components/success-message";
import { AuthErrorContainer } from "../components/auth-error-container";
import { requestPassword } from "@/app/services/server/actions/request-password";
import { LinkAnchor } from "@/app/components/ui/link-anchor";

export default function RequestPassword() {
  const [errors, setErrors] = useState<{
    emailError?: string;
    authError?: string;
    connectionError?: string;
  }>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setErrors({});
    setSuccess(null);

    try {
      const result = await requestPassword(formData);

      if (result.success) {
        setSuccess(result.message || null);
      } else if (result.errors) {
        setErrors(result.errors);
      }
    } catch (error) {
      console.error("Fehler beim Formular-Submit:", error);

      // Prüfen, ob es sich um einen Netzwerkfehler handelt
      if (error instanceof Error) {
        if (
          error.message.includes("fetch failed") ||
          error.message.includes("network") ||
          error.message.includes("AuthRetryableFetchError")
        ) {
          setErrors({
            connectionError:
              "Keine Internetverbindung. Bitte überprüfen Sie Ihre Netzwerkverbindung und versuchen Sie es erneut.",
          });
        } else {
          setErrors({ authError: "Ein unerwarteter Fehler ist aufgetreten." });
        }
      } else {
        setErrors({ authError: "Ein unerwarteter Fehler ist aufgetreten." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="">
      <h1 className="header mb-2">PASSWORT VERGESSEN?</h1>
      <p className="text-muted-foreground mb-4 text-sm sm:mb-6">
        Gib deine E-Mail-Adresse ein um dein Passwort zurückzusetzen.
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <form action={handleSubmit}>
            <div className="flex flex-col gap-6">
              {/* Email */}
              <div className="relative">
                <InputWithLabel
                  name="email"
                  label="E-Mail-Adresse"
                  aria-label="E-Mail-Adresse"
                  type="email"
                  id="email"
                  aria-invalid={!!errors.emailError}
                />
                <ErrorMessage message={errors.emailError || ""} />
              </div>
            </div>

            {/* Success Message */}
            <div className="relative">
              <SuccessMessage message={success} />
            </div>

            {/* Connection Error */}
            {errors && (
              <AuthErrorContainer
                error={errors.connectionError || errors.authError}
              />
            )}

            {/* Request button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Wird gesendet..." : "Passwort zurücksetzen"}
            </Button>
          </form>
          {/* Register link */}
          <div className="mt-2">
            <p className="text-center">
              <span className="mr-1.5 text-sm">Zurück zum</span>
              <LinkAnchor href="/login" className="text-primary underline">
                Login
              </LinkAnchor>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
