import { InputWithLabel } from "@/app/components/ui/input";
import { LoginButton } from "../components/login-button";
import PasswordInput from "../components/password-input";
import { ErrorMessage } from "../components/error-message";
import { signin } from "@/app/services/server/signin";
import { AuthErrorContainer } from "../components/auth-error-container";
import { LinkAnchor } from "@/app/components/ui/link-anchor";

type TSearchParams = {
  emailError?: string;
  authError?: string;
  passwordError?: string;
  connectionError?: string;
};

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<TSearchParams>;
}) {
  const { emailError, authError, passwordError, connectionError } =
    await searchParams;

  const returnToUrl = `/login${Object.entries(await searchParams)
    .filter(([key]) => key !== "emailError" && key !== "authError")
    .reduce(
      (acc, [key, value]) => `${acc}${acc ? "&" : "?"}${key}=${value}`,
      ""
    )}`;

  return (
    <div className="w-full">
      <h1 className="header mb-2">LOGIN</h1>
      <p className="text-muted-foreground mb-4 text-sm sm:mb-6">
        Gib deine E-Mail-Adresse und dein Passwort ein, um dich anzumelden.
      </p>

      <div className="flex flex-col gap-3 sm:gap-4">
        <form action={signin}>
          <div className="flex flex-col gap-3 sm:gap-6">
            {/* Hidden input for preserving current URL including parameters */}
            <input type="hidden" name="returnTo" value={returnToUrl} />

            {/* Email */}
            <div className="relative">
              <InputWithLabel
                name="email"
                autoComplete="email"
                label="E-Mail-Adresse"
                aria-label="E-Mail-Adresse"
                type="email"
                id="email"
                aria-invalid={!!emailError}
              />
              <ErrorMessage message={emailError || ""} />
            </div>

            <div className="flex flex-col gap-1.5">
              {/* Password */}
              <PasswordInput
                passwordError={passwordError || ""}
                showPasswordToggle
              />

              {/* Forgot password */}
              <div className="flex justify-end">
                <LinkAnchor
                  className="text-primary underline"
                  href="/request-password"
                >
                  Passwort vergessen
                </LinkAnchor>
              </div>
            </div>
          </div>

          {/* Error Messages */}
          <div className="relative mt-3 sm:mt-4">
            {/* Connection Error */}
            {connectionError && (
              <AuthErrorContainer error={connectionError} className="mb-2" />
            )}

            {/* Auth Error */}
            {authError && !connectionError && (
              <AuthErrorContainer error={authError} className="mb-2" />
            )}
          </div>

          {/* Login button */}
          <LoginButton />
        </form>

        {/* Register link */}
        <p className="text-center text-sm">
          Noch kein Konto bei uns?
          <LinkAnchor
            href="/registrieren"
            className="text-primary ml-1 underline"
          >
            Registriere dich jetzt
          </LinkAnchor>
        </p>
      </div>
    </div>
  );
}
