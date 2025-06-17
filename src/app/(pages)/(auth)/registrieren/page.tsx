import { InputWithLabel } from "@/app/components/ui/input";
import SignUpButton from "../components/sign-up-button";
import PasswordInput from "../components/password-input";
import { Check } from "lucide-react";
import { signup } from "@/app/services/server/signup";
import { ErrorMessage } from "../components/error-message";
import { AuthErrorContainer } from "../components/auth-error-container";
import { SuccessMessage } from "../components/success-message";
import { LinkAnchor } from "@/app/components/ui/link-anchor";

// Define the type for searchParams
type SearchParamsT = {
  token?: string;
  firstNameError?: string;
  lastNameError?: string;
  emailError?: string;
  passwordError?: string;
  confirmPasswordError?: string;
  authError?: string;
  success?: string;
  connectionError?: string;
  termsPrivacyError?: string;
  termsAgbError?: string;
};

export default async function Register({
  searchParams,
}: {
  searchParams: Promise<SearchParamsT>;
}) {
  // Wait for searchParams to ensure data is available
  const params = await Promise.resolve(searchParams);

  const token = params.token;
  const {
    firstNameError,
    lastNameError,
    emailError,
    passwordError,
    confirmPasswordError,
    authError,
    success,
    connectionError,
    termsPrivacyError,
    termsAgbError,
  } = params;

  // Create returnTo URL manually without using Object.entries
  let returnToUrl = "/registrieren";
  if (token) {
    returnToUrl += `?token=${token}`;
  }

  return (
    <div className="w-full">
      {/* TODO: Change register form text to your needs */}
      <h1 className="header mb-2">REGISTRIEREN</h1>
      <p className="text-muted-foreground mb-4 text-sm sm:mb-6">
        Erstelle dein Konto und werde Teil der Community.
      </p>

      <div className="flex flex-col gap-3 sm:gap-4">
        <form action={signup}>
          {/* Hidden input for preserving current URL including parameters */}
          <input type="hidden" name="returnTo" value={returnToUrl} />

          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Name Fields Row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {/* First Name */}
              <div className="relative">
                <InputWithLabel
                  name="first_name"
                  label="Vorname"
                  aria-label="Vorname"
                  type="text"
                  id="first_name"
                  aria-invalid={!!firstNameError}
                />
                <ErrorMessage message={firstNameError || ""} />
              </div>

              {/* Last Name */}
              <div className="relative">
                <InputWithLabel
                  name="last_name"
                  label="Nachname"
                  aria-label="Nachname"
                  type="text"
                  id="last_name"
                  aria-invalid={!!lastNameError}
                />
                <ErrorMessage message={lastNameError || ""} />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <InputWithLabel
                name="email"
                label="E-Mail-Adresse"
                aria-label="E-Mail-Adresse"
                autoComplete="email"
                type="email"
                id="email"
                aria-invalid={!!emailError}
              />
              <ErrorMessage message={emailError || ""} />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {/* Password */}
              <div className="relative">
                <PasswordInput
                  passwordError={passwordError || ""}
                  showPasswordToggle
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <PasswordInput
                  passwordError={passwordError || ""}
                  confirmPasswordError={confirmPasswordError || ""}
                  confirmPassword={true}
                />
              </div>
            </div>

            {/* Terms and Conditions Checkboxes */}
            <div className="mt-2 flex flex-col">
              {/* Privacy Checkbox */}
              <div className="relative">
                <label className="flex cursor-pointer items-start space-x-3">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      name="terms_privacy"
                      id="terms_privacy"
                      className="peer sr-only"
                      required
                    />
                    <div className="peer-checked:bg-primary peer-checked:border-primary size-5 rounded-sm border border-gray-300 bg-white transition-colors"></div>
                    <Check className="absolute top-0.5 left-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                  </div>
                  <span className="text-sm leading-relaxed">
                    Ich habe die{" "}
                    <LinkAnchor
                      href={`https://www.your-domain.de/datenschutz`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Datenschutzerklärung
                    </LinkAnchor>{" "}
                    gelesen und akzeptiere sie
                  </span>
                </label>
                <ErrorMessage message={termsPrivacyError || ""} />
              </div>
              {/* AGB Checkbox */}
              <div className="relative">
                <label className="flex cursor-pointer items-start space-x-3">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      name="terms_agb"
                      id="terms_agb"
                      className="peer sr-only"
                      required
                    />
                    <div className="peer-checked:bg-primary peer-checked:border-primary size-5 rounded-sm border border-gray-300 bg-white transition-colors"></div>
                    <Check className="absolute top-0.5 left-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                  </div>
                  <span className="text-sm leading-relaxed">
                    Ich habe die{" "}
                    <LinkAnchor
                      href={`https://www.your-domain.de/agb`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      AGB
                    </LinkAnchor>{" "}
                    gelesen und akzeptiere sie
                  </span>
                </label>
                <ErrorMessage message={termsAgbError || ""} />
              </div>
            </div>
          </div>

          {/* Error Messages */}
          <div className="relative mt-3 sm:mt-4">
            {/* Connection Error */}
            {connectionError && (
              <AuthErrorContainer error={connectionError} className="mb-2" />
            )}

            {/* Auth Error - only show if no connection error */}
            {authError && !connectionError && (
              <AuthErrorContainer error={authError} className="mb-2" />
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-3 sm:mb-4">
              <SuccessMessage message={success} />
            </div>
          )}

          {/* Sign-Up button */}
          <SignUpButton />
        </form>

        {/* Login link */}
        <p className="text-center text-sm">
          Du hast schon einen Account?
          <LinkAnchor href="/login" className="text-primary ml-1 underline">
            Jetzt anmelden!
          </LinkAnchor>
        </p>
      </div>
    </div>
  );
}
