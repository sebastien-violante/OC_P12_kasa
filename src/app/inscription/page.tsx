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

export default function Inscription() {
  const router = useRouter();
  const initFormData = {
    name: "",
    firstname: "",
    email: "",
    password: "",
    acceptCgu: false,
  };
  const [formData, setFormData] = useState<RegistrationFormData>(initFormData);
  const [errors, setErrors] = useState<z.core.$ZodIssue[]>([]);
  const [apiError, setApiError] = useState("");

  // Captation des données d'enregistrement dans FormData
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Récupération de l'erreur correspondant à un champ
  const getFieldError = (fieldName: string) => {
    return errors.find((error) => error.path.includes(fieldName));
  };

  const handleRegister = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    // validation des données par Zod
    const zodValidation = registerSchema.safeParse(formData);
    if (!zodValidation.success) {
      setErrors(zodValidation.error.issues);
      return;
    }

    // création de la payload
    const payload = {
      name: formData.firstname + " " + formData.name,
      email: formData.email,
      password: formData.password,
    };

    // enregistrement des valeurs
    try {
      const result = await postRequest<
        RegistrationPayload,
        RegistrationResponse
      >({
        url: "/api/auth/register",
        payload,
      });
      if (result.data) {
        localStorage.setItem(
          "flash",
          JSON.stringify({
            type: "success",
            message:
              "Votre inscription a bien été prise en compte. Vous pouvez vous connecter",
          }),
        );
        setApiError("");
        setErrors([]);
        setFormData(initFormData);
        router.push("/connexion");
      }
    } catch (error) {
      const apiError = error as ApiError;
      setApiError(apiError.message);
    }
  };

  return (
    <section className={styles.formWrapper}>
      <div className={styles.formHeader}>
        <h1>Rejoignez la communauté Kasa</h1>
        <p>
          Créez votre compte et commencez à voyager autrement : réservez des
          logements uniques, découvrez de nouvelles destinations et partagez vos
          propres lieux avec d’autres voyageurs.
        </p>
        <p className={styles.apiError} role="alert">
          {apiError}
        </p>
      </div>
      <form onSubmit={handleRegister} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nom</label>
          <input
            id="name"
            name="name"
            type="text"
            onChange={handleChange}
            aria-describedby={
              getFieldError("name") ? "name-error" : undefined
            }
            aria-invalid={getFieldError("name") ? "true" : "false"}
            className={getFieldError("name") ? styles.inputOnError : ""}
            autoComplete="family-name"
          ></input>
          {getFieldError("name") && (
            <p id="name-error" className={styles.fieldError} role="alert">
              {getFieldError("name")?.message}
            </p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="firstname">Prenom</label>
          <input
            id="firstname"
            name="firstname"
            type="text"
            onChange={handleChange}
            aria-describedby={
              getFieldError("firstname") ? "firstname-error" : undefined
            }
            aria-invalid={getFieldError("firstname") ? "true" : "false"}
            className={getFieldError("firstname") ? styles.inputOnError : ""}
            autoComplete="given-name"
          ></input>
          {getFieldError("firstname") && (
            <p id="firstname-error" className={styles.fieldError} role="alert">
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
            autoComplete="new-password"
          ></input>
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
        <button className={styles.submitBtn} type="submit">
          S&apos;inscrire
        </button>
      </form>
      <p className={styles.connect}>
        Déja membre ?{" "}
        <Link className={styles.connectLikn} href="/connexion">
          Se connecter
        </Link>
      </p>
    </section>
  );
}
