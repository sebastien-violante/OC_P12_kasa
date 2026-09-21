import { z } from "zod";

export const registerSchema = z.object({
  firstname: z
    .string()
    .min(2, "Le prénom doit comprendre au moins 2 caractères")
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ]+$/, {
    message: "Le prénom doit contenir des caractères alphabétiques ",
  }),
  name: z
    .string()
    .min(2, "Le nom doit comprendre au moins 2 caractères")
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ]+$/, {
    message: "Le nom doit contenir des caractères alphabétiques",
  }),
  email: z.email("Le format de l'email est invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins 1 majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins 1 chiffre")
    .regex(
      /[^A-Za-z0-9]/,
      "Le mot de passe doit contenir au moins 1 caractère spécial",
    ),
  acceptCgu: z.boolean().refine((value) => value === true, {
    message: "Vous devez accepter les conditions avant de vous inscrire",
  }),
});

export type registerFormData = z.infer<typeof registerSchema>;
