import { z } from "zod";

export const authSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse email est requise")
    .email("Le format de l'email est invalide"),

  password: z
    .string()
    .min(1, "Le mot de passe est requis"),
});