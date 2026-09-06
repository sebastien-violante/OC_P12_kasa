"use client";

import styles from "./page.module.css";
import { useState, useEffect, ChangeEvent } from "react";
import type { FlashType, LoginFormData } from "../types/types";
import FlashMessage from "../components/FlashMessage/FlashMessage";
import Link from "next/link";

export default function Connexion() {
    const [errors, setErrors] = useState<z.core.$ZodIssue[]>([]);
  
  const initFormData = {
      email: "",
      password: "",
    };
    const [formData, setFormData] = useState<LoginFormData>(initFormData);
  
  const [flash, setFlash] = useState<FlashType | null>(null);
  
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const { name, value} = event.target;
      setFormData((prev) => ({ ...prev, [name] : value }));
    };
  
  function handleLogin() {
    console.log("FORMDATA", formData)
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
      localStorage.removeItem('flash')
    }
  });

  return (
    <section className={styles.formWrapper}>
        { flash && <FlashMessage type={flash.type} message={flash.message}/>}
      <div className={styles.formHeader}>
        <h1>Heureux de vous revoir</h1>
        <p>
          Connectez-vous pour retrouver vos réservations, vos annonces et tout ce qui rend vos séjours uniques.
        </p>
      </div>
      <form onSubmit={handleLogin} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Adresse email</label>
          <input
            id="email"
            name="email"
            type="email"
            onChange={handleChange}
            className={getFieldError("email") ? styles.inputOnError : ""}
          ></input>
          {getFieldError("email") && (
            <p id="name-error" className={styles.fieldError} role="alert">
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
        
        <button className={styles.submitBtn} type="submit">Se connecter</button>
      </form>
      <p className={styles.connect}>Déja membre ? <Link className={styles.connectLikn} href="/connexion">Se connecter</Link></p>
    </section>
  )
}
