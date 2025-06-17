import { z } from "zod";
import { passwordSchema } from "./password-schema";
import { nameSchema } from "./name-schema";
import { emailSchema } from "./email-schema";

export type SignUpSchemaT = z.infer<typeof signUpSchema>;

export const signUpSchema = z
  .object({
    firstName: nameSchema,

    lastName: nameSchema,

    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Ist erforderlich"),
    termsPrivacy: z.boolean().refine((data) => data === true, {
      message: "Du musst die Datenschutzerklärung akzeptieren",
      path: ["termsPrivacy"],
    }),
    termsAgb: z.boolean().refine((data) => data === true, {
      message: "Du musst die AGB akzeptieren",
      path: ["termsAgb"],
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });
