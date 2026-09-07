"use client";

import styles from "./page.module.css";
import { useState, useEffect, ChangeEvent, SubmitEvent } from "react";
import type {
  FlashType,
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

export default function Connexion() {
  const initFormData = {
    email: "",
    password: "",
  };

  const [formData, setFormData] = useState<LoginFormData>(initFormData);
  const [errors, setErrors] = useState<z.core.$ZodIssue[]>([]);
  const [apiError, setApiError] = useState("");
  const [flash, setFlash] = useState<FlashType | null>(null);
  const router = useRouter();
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleLogin(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    // validation des données par Zod
    const zodValidation = authSchema.safeParse(formData);
    if (!zodValidation.success) {
      setErrors(zodValidation.error.issues);
      return;
    }
    // création de la payload
    const payload = {
      email: formData.email,
      password: formData.password,
    };
    // enregistrement des valeurs
    try {
      const result = await postRequest<
        AuthenticationPayload,
        AuthenticationResponse
      >({
        url: "/api/auth/login",
        payload,
      });
      if (result.data) {
        const token = result.data.token;
        const user = result.data.user;

        // enregistrement du token en cookie
        Cookies.set("token", result.data.token, {
          expires: 1 / 24,
          secure: true,
          sameSite: "strict",
        });
        // réinitialisation erroeurs et formulaire
        setApiError("");
        setErrors([]);
        setFormData(initFormData);

        router.push("/");
      }
    } catch (error) {
      const apiError = error as ApiError;
      setApiError(apiError.message);
    }
  }

  // Récupération de l'erreur correspondant à un champ
  const getFieldError = (fieldName: string) => {
    return errors.find((error) => error.path.includes(fieldName));
  };
  useEffect(() => {
    const flashBag = localStorage.getItem("flash");
    if (flashBag) {
      const pasedFlashBag = JSON.parse(flashBag);
      setFlash({
        type: pasedFlashBag.type,
        message: pasedFlashBag.message,
      });
      localStorage.removeItem("flash");
    }
  });

  return (
    <section className={styles.formWrapper}>
      {flash && <FlashMessage type={flash.type} message={flash.message} />}
      <div className={styles.formHeader}>
        <h1>Heureux de vous revoir</h1>
        <p>
          Connectez-vous pour retrouver vos réservations, vos annonces et tout
          ce qui rend vos séjours uniques.
        </p>
      </div>
      <form onSubmit={handleLogin} className={styles.form}>
        <p className={styles.apiError} role="alert">
          {apiError}
        </p>
        <div className={styles.formGroup}>
          <label htmlFor="email">Adresse email</label>
          <input
            id="email"
            name="email"
            type="email"
            onChange={handleChange}
            aria-describedby={
              getFieldError("email") ? "email-error" : undefined
            }
            aria-invalid={getFieldError("email") ? "true" : "false"}
            className={getFieldError("email") ? styles.inputOnError : ""}
            autoComplete="email"

          ></input>
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
            onChange={handleChange}
            aria-describedby={
              getFieldError("password") ? "password-error" : undefined
            }
            aria-invalid={getFieldError("password") ? "true" : "false"}
            className={getFieldError("password") ? styles.inputOnError : ""}
            autoComplete="password"
          ></input>
          {getFieldError("password") && (
            <p id="password-error" className={styles.fieldError} role="alert">
              {getFieldError("password")?.message}
            </p>
          )}
        </div>

        <button className={styles.submitBtn} type="submit">
          Se connecter
        </button>
      </form>
      <p className={styles.link}>
        <Link href="/mot-de-passe-oublie">Mot de passe oublié</Link>
      </p>
      <p className={styles.link}>
        Pas encore de compte ?{" "}
        <Link className={styles.connectLink} href="/inscription">
          Inscrivez-vous
        </Link>
      </p>
    </section>
  );
}
