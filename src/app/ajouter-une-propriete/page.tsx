"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { equipements } from "../data/equipments";
import getRequest from "../utils/getRequest";
import Tag from "../components/Tag/Tag";
import { ChangeEvent } from "react";
import type { PropertyFormData } from "../types/types";
import z from "zod";
import { newPropertySchema } from "../types/schemas/newPropertySchema";

export default function Addproperty() {
  const [cover, setCover] = useState<File | null>(null);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [profile, setProfile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<z.core.$ZodIssue[]>([]);
  const pictureInputRef = useRef<(HTMLInputElement | null)[]>([]);

  const initFormData: PropertyFormData = {
    title: "",
    description: "",
    postalCode: "",
    location: "",
    cover: "",
    pictures: [],
    name: "",
    profile: "",
    equipments: [],
    categories: [],
  };

  const [formData, setFormData] = useState(initFormData);

  // Captation des données d'enregistrement dans FormData
  const handleInputValue = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const target = event.target;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFormData((prev) => {
        if (target.checked) {
          return {
            ...prev,
            equipments: [...prev.equipments, target.name],
          };
        }

        return {
          ...prev,
          equipments: prev.equipments.filter(
            (equipment) => equipment !== target.name,
          ),
        };
      });

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [target.name]: target.value,
    }));
  };

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setCover(file);
  }

  function handleProfileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfile(file);
  }

  function handleImageChange(
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setImages((prev) => {
      const newImages = [...prev];
      newImages[index] = file;
      return newImages;
    });
  }

  function handleNewTagChange(value: string) {
    setNewTag(value);
  }

  const handleAddTag = () => {
    const formatedTag = newTag.charAt(0).toUpperCase() + newTag.slice(1).trim();

    if (!formatedTag) return;

    setTags((prev) => [...prev, formatedTag]);

    setFormData((prev) => ({
      ...prev,
      categories: [...prev.categories, formatedTag],
    }));

    setNewTag("");
  };

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => {
      if (prev.categories.includes(tag)) {
        return {
          ...prev,
          categories: prev.categories.filter((category) => category !== tag),
        };
      }

      return {
        ...prev,
        categories: [...prev.categories, tag],
      };
    });
  };

  function addImage() {
    setImages((prev) => [...prev, null]);
  }

  // Récupération de l'erreur correspondant à un champ
  const getFieldError = (fieldName: string) => {
    return errors.find((error) => error.path.includes(fieldName));
  };

  function addPorperty() {
    const data = {
      ...formData,
      cover: cover,
      profile: profile,
      pictures: images,
    };

    console.log("FORMDATA", data);
    // vérification Zod et affichage erreurs
    const zodValidation = newPropertySchema.safeParse(formData);
    if (!zodValidation.success) {
      setErrors(zodValidation.error.issues);
      console.log(errors);
      return;
    }
    // si pas possible vérification taille, vérif taille et affichage erreurs
    // création payload (attention formatag champs)
    // bouclage pictures et réception url publiques
    // ajout des pictures et cover au POST de property
    // envoi profile en PATCH de user
  }

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getRequest<string[]>({ url: "api/tags" });
        setTags(tags);
      } catch (error) {
        console.error(error);
      }
    };

    loadTags();
  }, []);
  return (
    <>
      <section className={styles.header}>
        <Link href="/" className={styles.backToProperties}>
          <img src="/pictures/back-arrow.svg" alt="" />
          <span>Retour</span>
        </Link>
        <h1>Ajouter une propriété</h1>
      </section>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          addPorperty();
        }}
        noValidate
      >
        <button type="submit" className={styles.submitBtn}>
          Ajouter
        </button>

        <article className={styles.mainData}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Titre de la propriété</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Ex : Appartement cosy au coeur de paris"
              onChange={handleInputValue}
              required
              aria-describedby={
                getFieldError("title") ? "title-error" : undefined
              }
              aria-invalid={getFieldError("title") ? "true" : "false"}
              className={getFieldError("title") ? styles.inputOnError : ""}
            />
            {getFieldError("title") && (
              <p id="title-error" className={styles.fieldError} role="alert">
                {getFieldError("title")?.message}
              </p>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Décrivez votre propriété en détail..."
              rows={3}
              required
              onChange={handleInputValue}
              aria-describedby={
                getFieldError("description") ? "description-error" : undefined
              }
              aria-invalid={getFieldError("description") ? "true" : "false"}
              className={
                getFieldError("description") ? styles.inputOnError : ""
              }
            />
            {getFieldError("description") && (
              <p
                id="description-error"
                className={styles.fieldError}
                role="alert"
              >
                {getFieldError("description")?.message}
              </p>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="postalCode">Code postal</label>
            <input
              type="text"
              pattern="\d{5}"
              maxLength={5}
              inputMode="numeric"
              id="postalCode"
              name="postalCode"
              onChange={handleInputValue}
              required
              aria-describedby={
                getFieldError("postalCode") ? "postalCode-error" : undefined
              }
              aria-invalid={getFieldError("postalCode") ? "true" : "false"}
              className={getFieldError("postalCode") ? styles.inputOnError : ""}
            />
            {getFieldError("postalCode") && (
              <p
                id="postalCode-error"
                className={styles.fieldError}
                role="alert"
              >
                {getFieldError("postalCode")?.message}
              </p>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="location">Localisation</label>
            <input
              type="text"
              id="location"
              name="location"
              onChange={handleInputValue}
              required
              aria-describedby={
                getFieldError("location") ? "location-error" : undefined
              }
              aria-invalid={getFieldError("location") ? "true" : "false"}
              className={getFieldError("location") ? styles.inputOnError : ""}
            />
            {getFieldError("location") && (
              <p id="location-error" className={styles.fieldError} role="alert">
                {getFieldError("location")?.message}
              </p>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="location">Prix par nuitée (€)</label>
            <input
              type="text"
              id="price_per_night"
              name="price_per_night"
              onChange={handleInputValue}
              required
              aria-describedby={
                getFieldError("price_per_night") ? "price_per_night-error" : undefined
              }
              aria-invalid={getFieldError("price_per_night") ? "true" : "false"}
              className={getFieldError("price_per_night") ? styles.inputOnError : ""}
            />
            {getFieldError("price_per_night") && (
              <p id="price_per_night-error" className={styles.fieldError} role="alert">
                {getFieldError("price_per_night")?.message}
              </p>
            )}
          </div>
        </article>
        <article className={styles.pictures}>
          <div className={styles.choosePictures}>
            <div className={styles.formGroup}>
              {/* Image de couverture */}
              <label htmlFor="coverFileName">Image de couverture</label>
              <div className={styles.inputWrapper}>
                <input
                  id="coverFileName"
                  type="text"
                  value={cover?.name || ""}
                  onChange={handleInputValue}
                  readOnly
                />
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={() => coverInputRef.current?.click()}
                  aria-label="Choisir une photo de couverture"
                >
                  <span aria-hidden="true">+</span>
                </button>
                <input
                  ref={coverInputRef}
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleCoverChange}
                />
              </div>

              {/* Images du logement */}
              <label htmlFor="propertyPictures">Images du logement</label>

              {images?.map((image, index) => {
                const inputId = `propertyPicture-${index}`;
                return (
                  <div className={styles.formGroup} key={index}>
                    {" "}
                    <div className={styles.inputWrapper}>
                      {" "}
                      <input
                        id={`${inputId}-name`}
                        type="text"
                        value={image?.name || ""}
                        readOnly
                        aria-label={`Photo du logement ${index + 1}`}
                      />{" "}
                      <button
                        type="button"
                        className={styles.addButton}
                        onClick={() => pictureInputRef.current[index]?.click()}
                        aria-label={`Choisir la photo du logement ${index + 1}`}
                      >
                        {" "}
                        <span aria-hidden="true">+</span>{" "}
                      </button>{" "}
                      <input
                        id={inputId}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleImageChange(index, e)}
                        ref={(element) => {
                          pictureInputRef.current[index] = element;
                        }}
                      />{" "}
                    </div>{" "}
                  </div>
                );
              })}

              <button
                type="button"
                className={styles.addImage}
                onClick={addImage}
              >
                +Ajouter une image
              </button>
            </div>
          </div>
          <div className={styles.chooseProfile}>
            <div className={styles.formGroup}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Nom de l&apos;hôte</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  onChange={handleInputValue}
                  required
                  aria-describedby={
                    getFieldError("name") ? "name-error" : undefined
                  }
                  aria-invalid={getFieldError("name") ? "true" : "false"}
                  className={getFieldError("name") ? styles.inputOnError : ""}
                />
                {getFieldError("name") && (
                  <p id="name-error" className={styles.fieldError} role="alert">
                    {getFieldError("name")?.message}
                  </p>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="profilePicture">Photo de profil</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="profilePicture"
                    type="text"
                    value={profile?.name || ""}
                    readOnly
                    aria-label="Photo de profil sélectionnée"
                  />

                  <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => profileInputRef.current?.click()}
                    aria-label="Choisir une photo de profil"
                  >
                    <span aria-hidden="true">+</span>
                  </button>

                  <input
                    ref={profileInputRef}
                    id="profile"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </article>
        <fieldset className={styles.equipments}>
          <legend className={styles.sectionLabel}>Équipements</legend>
          <div className={styles.checkboxes}>
            {equipements.map((equipment) => (
              <div className={styles.checkbox} key={equipment}>
                <input
                  type="checkbox"
                  id={equipment}
                  name={equipment}
                  checked={formData.equipments.includes(equipment)}
                  onChange={handleInputValue}
                />
                <label htmlFor={equipment}>{equipment}</label>
              </div>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.categories}>
          <legend className={styles.sectionLabel}>Catégories</legend>
          <div className={styles.categoryList}>
            {tags.map((tag) => (
              <Tag
                key={tag}
                item={tag}
                select={false}
                selected={formData.categories.includes(tag)}
                onToggle={handleTagToggle}
              />
            ))}
          </div>

          <label htmlFor="newTag">Ajouter une catégorie personnalisée</label>

          <div className={styles.formGroup}>
            <div className={styles.inputWrapper}>
              <input
                id="newTag"
                type="text"
                onChange={(e) => handleNewTagChange(e.target.value)}
                value={newTag}
              />

              <button
                type="button"
                className={styles.addButton}
                onClick={() => handleAddTag()}
                aria-label="Ajouter la catégorie"
              >
                <span aria-hidden="true">+</span>
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    </>
  );
}
