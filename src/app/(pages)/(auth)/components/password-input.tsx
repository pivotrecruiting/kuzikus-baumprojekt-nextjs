import { InputWithLabel } from "@/app/components/ui/input";
import { ErrorMessage } from "./error-message";
import type { ChangeEvent } from "react";

export default function PasswordInput({
  passwordError,
  confirmPasswordError,
  showPasswordToggle = false,
  confirmPassword = false,
  value,
  required,
  onChange,
}: {
  passwordError: string;
  confirmPasswordError?: string;
  showPasswordToggle?: boolean;
  confirmPassword?: boolean;
  value?: string;
  required?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  // Bestimme die Prop-Werte basierend auf confirmPassword
  const name = confirmPassword ? "confirm_password" : "password";
  const label = confirmPassword ? "Passwort bestätigen" : "Passwort";
  const id = confirmPassword ? "confirm_password" : "password";

  // Bestimme die Fehlermeldung basierend darauf, ob es ein Bestätigungspasswort ist
  const errorMessage = confirmPassword
    ? confirmPasswordError || ""
    : passwordError || "";

  return (
    <div className="relative">
      <InputWithLabel
        name={name}
        autoComplete="current-password"
        label={label}
        aria-label={label}
        type="password"
        id={id}
        required={required}
        showPasswordToggle={showPasswordToggle}
        value={value}
        onChange={onChange}
      />
      <ErrorMessage message={errorMessage} />
    </div>
  );
}
