import z from "zod";

export const newPropertySchema = z.object({
  title: z.string().min(3, "Le titre doit comprendre au moins 3 caractères"),

  description: z
    .string()
    .min(3, "La description doit comprendre au moins 10 caractères"),

  postalCode: z.string().regex(/^\d{5}$/, "Code postal invalide"),

  location: z
    .string()
    .min(3, "La localisation doit comprendre au moins 3 caractères"),

  name: z
    .string()
    .regex(
      /^[A-Za-zÀ-ÖØ-öø-ÿÀ-ÿ' -]+$/,
      "Le nom doit comprendre au moins 3 caractères (alphabétiques, espaces et tirets)",
    ),

  cover: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "L'image ne doit pas dépasser 5 Mo",
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Format accepté : JPEG, PNG ou WebP",
    ),

profile: z
  .instanceof(File)
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "L'image ne doit pas dépasser 5 Mo"
  )
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "Format accepté : JPEG, PNG ou WebP"
  ),

price_per_night: z
    .coerce
    .number("Le montant doit être entier sans décimale")
    .int()
    .nonnegative("Le montant ne peut pas être négatif")
    .min(10, "Le montant de la nuitée doit être au moins de 10 euros")
});
