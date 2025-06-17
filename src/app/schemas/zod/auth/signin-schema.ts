import { z } from "zod";
import { emailSchema } from "./email-schema";

export type SignInSchemaT = z.infer<typeof signinSchema>;

export const signinSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Passwort ist erforderlich"),
});
