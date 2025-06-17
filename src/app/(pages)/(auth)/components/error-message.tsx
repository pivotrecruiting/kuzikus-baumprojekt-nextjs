import React from "react";
import { cn } from "@/lib/utils";

type ErrorMessageProps = {
  message: string;
  className?: string;
};

export const ErrorMessage = ({ message, className }: ErrorMessageProps) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        "text-destructive absolute -bottom-4.5 left-0 text-xs",
        className
      )}
    >
      {message}
    </div>
  );
};
