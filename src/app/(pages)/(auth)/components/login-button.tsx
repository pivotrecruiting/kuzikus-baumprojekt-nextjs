"use client";

import { Button } from "@/app/components/ui/button";
import { useFormStatus } from "react-dom";

export function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="mt-10 w-full">
      {pending ? "Anmelden..." : "Anmelden"}
    </Button>
  );
}
