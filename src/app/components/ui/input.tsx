"use client";
import React, { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Additional props
  error?: boolean | string;
  helperText?: string;
  containerClassName?: string;
}

export interface InputWithLabelProps extends InputProps {
  label?: string;
  labelClassName?: string;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      error = false,
      helperText,
      containerClassName,
      ...props
    },
    ref
  ) => {
    // Base input styles
    const inputStyles = cn(
      "bg-input rounded-md px-4 py-3 w-full text-[16px] ",
      "outline-none focus:outline focus:outline-none focus:border-transparent focus:ring-0",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      error ? "outline outline-destructive" : "border-transparent",
      className
    );

    // Determine if there's an error (either boolean true or non-empty string)
    const hasError = Boolean(error);

    // If error is a string, use it as helperText
    const displayHelperText = typeof error === "string" ? error : helperText;

    return (
      <div className="flex w-full flex-col">
        <div className={cn("relative", containerClassName)}>
          <input type={type} className={inputStyles} ref={ref} {...props} />

          {/* Absolut positionierte Fehlermeldung */}
          {displayHelperText && (
            <p
              className={cn(
                "absolute -bottom-5 left-1 text-sm",
                hasError ? "text-destructive" : "text-foreground/70"
              )}
            >
              {displayHelperText}
            </p>
          )}
        </div>
      </div>
    );
  }
);

const InputWithLabel = forwardRef<HTMLInputElement, InputWithLabelProps>(
  (
    {
      className,
      label,
      labelClassName,
      id,
      type,
      showPasswordToggle = false,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

    // Toggle password visibility
    const togglePasswordVisibility = () => {
      setIsPasswordVisible((prev) => !prev);
    };

    // Nur für Passwort-Felder anwenden und wenn Toggle aktiviert ist
    const isPassword = type === "password";
    const showToggle = isPassword && showPasswordToggle;

    // Aktueller Input-Typ basierend auf Sichtbarkeit
    const currentType = isPassword && isPasswordVisible ? "text" : type;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className={cn("pl-1 text-sm", labelClassName)}>
            {label}
          </label>
        )}
        <div className="relative">
          <Input
            id={id}
            className={cn(showToggle && "pr-10", className)}
            type={currentType}
            ref={ref}
            {...props}
          />
          {showToggle && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-foreground/80 hover:text-foreground absolute top-4 right-5 cursor-pointer"
              aria-label={
                isPasswordVisible ? "Passwort verbergen" : "Passwort anzeigen"
              }
            >
              {isPasswordVisible ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";
InputWithLabel.displayName = "InputWithLabel";

export { Input, InputWithLabel };
