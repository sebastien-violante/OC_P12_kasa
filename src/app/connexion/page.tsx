"use client";

import styles from "./page.module.css";
import { useState, useEffect, ChangeEvent, SubmitEvent } from "react";
import type {
  FlashMessageType,
  LoginFormData,
  AuthenticationPayload,
  AuthenticationResponse,
  ApiError,
} from "../types/types";
import FlashMessage from "../components/FlashMessage/FlashMessage";
import Link from "next/link";
import z from "zod";
import { authSchema } from "../types/schemas/authSchema";
import postRequest from "../utils/postRequest";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../utils/api";

/**
 * Page de connexion utilisateur.
 *
 * Gère :
 * - la saisie et la validation des identifiants ;
 * - l'authentification auprès de l'API ;
 * - la persistance du token d'authentification ;
 * - la mise à jour du contexte utilisateur ;
 * - le chargement des favoris de l'utilisateur ;
 * - l'affichage des erreurs de validation et des erreurs API ;
 * - la redirection vers la page d'accueil après connexion.
 *
 * @returns {JSX.Element} Le formulaire de connexion.
 */
export default function Connexion() {
  const initFormData: LoginFormData = {
    email: "",
    password: "",
  };

  const [formData, setFormData] = useState<LoginFormData>(initFormData);
  const [errors, setErrors] = useState<z.core.$ZodIssue[]>([]);
  const [apiError, setApiError] = useState("");
  const [flash, setFlash] = useState<FlashMessageType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  /**
   * Met à jour la valeur du champ modifié dans le formulaire.
   * @param {ChangeEvent<HTMLInputElement>} event Événement de modification du champ.
   */
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
   * Valide et soumet le formulaire de connexion.
   * @param {SubmitEvent<HTMLFormElement>} event Événement de soumission du formulaire.
   */
  async function handleLogin(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    // Validation avant de passer le formulaire en état de soumission.
    const zodValidation = authSchema.safeParse(formData);

    if (!zodValidation.success) {
      setErrors(zodValidation.error.issues);
      return;
    }

    setIsSubmitting(true);

    // Création de la charge utile attendue par l'API d'authentification.
    const payload: AuthenticationPayload = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const result = await postRequest<
        AuthenticationPayload,
        AuthenticationResponse
      >({
        url: apiUrl("/auth/login"),
        payload,
      });

      if (result.data) {
        const { token, user } = result.data;

        // Le token est conservé temporairement pour les requêtes authentifiées.
        Cookies.set("token", token, {
          expires: 1 / 24,
          secure: true,
          sameSite: "strict",
        });

        // Mise à jour du contexte d'authentification avec la valeur de l'utilisateur connecté.
        console.log("USER DANS CONNEXION", user)
        login(user);

        // Nettoyage de l'état du formulaire avant la redirection.
        setApiError("");
        setErrors([]);
        setFormData(initFormData);

        router.push("/");
      }
    } catch (error) {
      const apiError = error as ApiError;

      // Une erreur 401 est volontairement présentée avec un message générique.
      if (apiError.status === 401) {
        setApiError("Identifiants invalides");
      } else {
        setApiError(apiError.message);
      }

      setFormData(initFormData);
      setErrors([]);
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Récupère le message flash éventuellement transmis par une page précédente.
   */
  useEffect(() => {
    const flashBag = localStorage.getItem("flash");

    if (flashBag) {
      const parsedFlashBag = JSON.parse(flashBag);

      setFlash({
        status: parsedFlashBag.type,
        message: parsedFlashBag.message,
      });

      localStorage.removeItem("flash");
    }
  }, []);

  return (
    <div className={styles.interiorPadding}>
      <section className={styles.formWrapper}>
        {flash && (
          <FlashMessage status={flash.status} message={flash.message} />
        )}

        <div className={styles.formHeader}>
          <h1>Heureux de vous revoir</h1>
          <p>
            Connectez-vous pour retrouver vos réservations, vos annonces et tout
            ce qui rend vos séjours uniques.
          </p>
        </div>

        <form onSubmit={handleLogin} className={styles.form} noValidate>
          {apiError && (
            <p id="api-error" role="alert" className={styles.apiError}>
              {apiError}
            </p>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Adresse email</label>

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
              autoComplete="current-password"
            />

            {getFieldError("password") && (
              <p id="password-error" className={styles.fieldError} role="alert">
                {getFieldError("password")?.message}
              </p>
            )}
          </div>

          <button
            className={styles.submitBtn}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Connexion en cours…" : "Se connecter"}
          </button>
        </form>

        <p className={styles.link}>
          <Link href="">Mot de passe oublié</Link>
        </p>

        <p className={styles.link}>
          Pas encore de compte ?{" "}
          <Link className={styles.connectLink} href="/inscription">
            Inscrivez-vous
          </Link>
        </p>
      </section>
    </div>
  );
}
