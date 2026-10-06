"use client";

import styles from "./page.module.css";
import { useState, SubmitEvent, ChangeEvent } from "react";
import Link from "next/link";
import {
  RegistrationResponse,
  RegistrationPayload,
  RegistrationFormData,
  ApiError,
} from "../types/types";
import z from "zod";
import { registerSchema } from "../types/schemas/registerSchema";
import postRequest from "../utils/postRequest";
import { useRouter } from "next/navigation";
import { apiUrl } from "../utils/api";
import { useAuth } from "../context/AuthContext";

/**
 * Page d'inscription utilisateur.
 *
 * Gère :
 * - la saisie des informations personnelles ;
 * - la validation des données avec Zod ;
 * - l'inscription auprès de l'API ;
 * - la gestion des erreurs retournées par l'API ;
 * - l'affichage d'un message de succès après inscription ;
 * - la redirection vers la page de connexion.
 *
 * @returns {JSX.Element} Le formulaire d'inscription.
 */
export default function Inscription() {
  const router = useRouter();
  const { login } = useAuth()
  const initFormData: RegistrationFormData = {
    name: "",
    firstname: "",
    email: "",
    password: "",
    acceptCgu: false,
  };

  const [formData, setFormData] = useState<RegistrationFormData>(initFormData);
  const [errors, setErrors] = useState<z.core.$ZodIssue[]>([]);
  const [apiError, setApiError] = useState("");
  const [isSubmiting, setIsSubmiting] = useState(false);

  /**
   * Met à jour les données du formulaire à chaque modification d'un champ.
   * @param {ChangeEvent<HTMLInputElement>} event Événement de modification du champ.
   */
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  /**
   * Recherche l'erreur de validation associée à un champ.
   * @param {string} fieldName Nom du champ à rechercher dans les erreurs Zod.
   * @returns {z.core.$ZodIssue | undefined} L'erreur correspondante, si elle existe.
   */
  function getFieldError(fieldName: string) {
    return errors.find((error) => error.path.includes(fieldName));
  }

  /**
   * Valide et soumet le formulaire d'inscription.
   * @param {SubmitEvent<HTMLFormElement>} event Événement de soumission du formulaire.
   */
  async function handleRegister(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    // Validation des données avant de lancer la soumission.
    const zodValidation = registerSchema.safeParse(formData);

    if (!zodValidation.success) {
      setErrors(zodValidation.error.issues);
      return;
    }

    setIsSubmiting(true);

    // Préparation de la payload au format attendu par l'API.
    const payload: RegistrationPayload = {
      name:
        formData.firstname.charAt(0).toUpperCase() +
        formData.firstname.slice(1).trim() +
        " " +
        formData.name.charAt(0).toUpperCase() +
        formData.name.slice(1).trim(),
      email: formData.email,
      password: formData.password,
    };

    try {
      const result = await postRequest<
        RegistrationPayload,
        RegistrationResponse
      >({
        url: apiUrl("/auth/register"),
        payload,
      });

      if (result.data) {
        
        login(result.data.user)
        // Le message est mis "en tampon" dans localStorage pour être récupéré par la page connexion après redirection
        localStorage.setItem(
          "flash",
          JSON.stringify({
            type: "success",
            message: "Votre inscription a réussi. Rejoignez-nous !",
          }),
        );

        // Réinitialisation du formulaire avant la redirection.
        setApiError("");
        setErrors([]);
        setFormData(initFormData);

        router.push("/connexion");
      }
    } catch (error) {
      const apiError = error as ApiError;

      // L'erreur 409 correspond à une adresse email déjà enregistrée.
      if (apiError.status === 409) {
        setApiError("Cet email est déjà utilisé !");
      } else {
        setApiError(apiError.message);
      }

      setFormData(initFormData);
      setErrors([]);
    } finally {
      setIsSubmiting(false);
    }
  }

  return (
    <div className={styles.interiorPadding}>
      <section className={styles.formWrapper}>
        <div className={styles.formHeader}>
          <h1>Rejoignez la communauté Kasa</h1>

          <p>
            Créez votre compte et commencez à voyager autrement : réservez des
            logements uniques, découvrez de nouvelles destinations et partagez
            vos propres lieux avec d’autres voyageurs.
          </p>

          {apiError && (
            <p className={styles.apiError} role="alert">
              {apiError}
            </p>
          )}
        </div>

        <form onSubmit={handleRegister} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nom</label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              aria-describedby={
                getFieldError("name") ? "name-error" : undefined
              }
              aria-invalid={getFieldError("name") ? "true" : "false"}
              className={getFieldError("name") ? styles.inputOnError : ""}
              autoComplete="family-name"
            />

            {getFieldError("name") && (
              <p id="name-error" className={styles.fieldError} role="alert">
                {getFieldError("name")?.message}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="firstname">Prénom</label>

            <input
              id="firstname"
              name="firstname"
              type="text"
              value={formData.firstname}
              onChange={handleChange}
              aria-describedby={
                getFieldError("firstname") ? "firstname-error" : undefined
              }
              aria-invalid={getFieldError("firstname") ? "true" : "false"}
              className={getFieldError("firstname") ? styles.inputOnError : ""}
              autoComplete="given-name"
            />

            {getFieldError("firstname") && (
              <p
                id="firstname-error"
                className={styles.fieldError}
                role="alert"
              >
                {getFieldError("firstname")?.message}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              aria-describedby={
                getFieldError("email") ? "email-error" : undefined
              }
              aria-invalid={getFieldError("email") ? "true" : "false"}
              className={getFieldError("email") ? styles.inputOnError : ""}
              autoComplete="email"
            />

            {getFieldError("email") && (
              <p id="email-error" className={styles.fieldError} role="alert">
                {getFieldError("email")?.message}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Mot de passe</label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              aria-describedby={
                getFieldError("password") ? "password-error" : undefined
              }
              aria-invalid={getFieldError("password") ? "true" : "false"}
              className={getFieldError("password") ? styles.inputOnError : ""}
              autoComplete="new-password"
            />

            {getFieldError("password") && (
              <p id="password-error" className={styles.fieldError} role="alert">
                {getFieldError("password")?.message}
              </p>
            )}
          </div>

          <div className={styles.acceptCgu}>
            <input
              type="checkbox"
              id="acceptCgu"
              name="acceptCgu"
              checked={formData.acceptCgu}
              onChange={handleChange}
              aria-describedby={
                getFieldError("acceptCgu") ? "acceptCgu-error" : undefined
              }
              aria-invalid={getFieldError("acceptCgu") ? "true" : "false"}
            />

            <label htmlFor="acceptCgu">
              J&apos;accepte les{" "}
              <span>conditions générales d&apos;utilisation</span>
            </label>
          </div>

          {getFieldError("acceptCgu") && (
            <p id="acceptCgu-error" className={styles.fieldError} role="alert">
              {getFieldError("acceptCgu")?.message}
            </p>
          )}

          <button
            className={styles.submitBtn}
            type="submit"
            disabled={isSubmiting}
            aria-busy={isSubmiting}
          >
            {isSubmiting ? "Inscription en cours…" : "S'inscrire"}
          </button>
        </form>

        <p className={styles.connect}>
          Déjà membre ?{" "}
          <Link className={styles.connectLikn} href="/connexion">
            Se connecter
          </Link>
        </p>
      </section>
    </div>
  );
}
