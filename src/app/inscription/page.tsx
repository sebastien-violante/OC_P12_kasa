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
  
  const router=useRouter()
  const initFormData = {
    name: "",
    firstname: "",
    email: "",
    password: "",
    acceptCgu: false
  };
  const [formData, setFormData] = useState<RegistrationFormData>(initFormData);
  const [errors, setErrors] = useState<z.core.$ZodIssue[]>([]);
  const [apiError, setApiError] = useState("")

  // Captation des données d'enregistrement dans FormData
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked} = event.target;
    setFormData((prev) => ({ ...prev, [name]: type==="checkbox" ? checked : value }));
  };

  // Récupération de l'erreur correspondant à un champ
  const getFieldError = (fieldName: string) => {
    return errors.find((error) => error.path.includes(fieldName));
  };

  const handleRegister = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
console.log(formData)
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
      password: formData.password
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
      if(result.data) {
        localStorage.setItem("flash",  JSON.stringify({
            type: 'success',
            message: "Votre inscription a bien été prise en compte. Vous pouvez vous connecter",
          }))
        setApiError("")
        setErrors([])
        setFormData(initFormData)
        router.push("/connexion");
      }
      
    } catch (error) {
      const apiError = error as ApiError;
      setApiError(apiError.message)
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
        <p className={styles.apiError}>{apiError}</p>
      </div>
      <form onSubmit={handleRegister} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nom</label>
          <input
            id="name"
            name="name"
            type="text"
            onChange={handleChange}
            className={getFieldError("name") ? styles.inputOnError : ""}
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
            className={getFieldError("firstname") ? styles.inputOnError : ""}
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
            className={getFieldError("email") ? styles.inputOnError : ""}
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
            className={getFieldError("password") ? styles.inputOnError : ""}
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
            onChange={handleChange}/>
          <label>J&apos;accepte les <span>conditions générales d&apos;utilisation</span></label>
          
        </div>
        {getFieldError("acceptCgu") && (
            <p id="acceptCgu-error" className={styles.fieldError} role="alert">
              {getFieldError("acceptCgu")?.message}
            </p>
          )}
        <button className={styles.submitBtn} type="submit">S&apos;inscrire</button>
      </form>
      <p className={styles.connect}>Déja membre ? <Link className={styles.connectLikn} href="/connexion">Se connecter</Link></p>
    </section>
  );
}
