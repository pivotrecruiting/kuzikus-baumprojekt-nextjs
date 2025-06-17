import { z } from "zod";

// Email schema with domain restriction for your project
export const emailSchema = z
  .string()
  .trim()
  .min(1, "E-Mail ist erforderlich")
  .max(255, "E-Mail ist zu lang")
  .email({ message: "Ungültige E-Mail-Adresse" });
//   TODO: Add domain validation back in for production (if needed)
//   .refine((email) => email.endsWith("@your-email.de"), {
//     message: "E-Mail muss mit @your-email.de enden",
//   });

// Email type for type inference
export type EmailSchemaT = z.infer<typeof emailSchema>;
