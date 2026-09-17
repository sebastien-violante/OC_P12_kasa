"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { equipements } from "../data/equipments";
import getRequest from "../utils/getRequest";
import Tag from "../components/Tag/Tag";
import { ChangeEvent } from "react";
import type { CreatePropertyPayload, PropertyFormData } from "../types/types";
import z from "zod";
import { newPropertySchema } from "../types/schemas/newPropertySchema";
import { useAuth } from "../context/AuthContext";
import Cookies from "js-cookie";
import patchRequest from "../utils/patchRequest";
import postRequest from "../utils/postRequest";
import getPictureUrls from "../utils/getPictureUrls";
import type { Property, User } from "../types/types";
import { useRouter } from "next/navigation";


export default function Addproperty() {
  const token = Cookies.get("token");
  const router = useRouter()
  const [cover, setCover] = useState<File | null>(null);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [profile, setProfile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<z.core.$ZodIssue[]>([]);
  const pictureInputRef = useRef<(HTMLInputElement | null)[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileFileName, setProfileFileName] = useState("");
  const { user, updateUser } = useAuth();
  const initFormData: PropertyFormData = {
  title: "",
  description: "",
  postalCode: "",
  location: "",
  cover: null,
  pictures: [],
  name: "",
  profile: null,
  equipments: [],
  categories: [],
  price_per_night: "",
};

const [formData, setFormData] = useState<PropertyFormData>(initFormData);
useEffect(() => {
  if (!user) return;

  console.log("Je mets le nom dans le formulaire :", user.name);

  setFormData((prev) => ({
    ...prev,
    name: user.name,
  }));
}, [user]);

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
    setProfileFileName(file.name);
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

  async function updateProfilePicture(profilePicture: string) {
    if (!user) {
      return null;
    }

    const payload = {
      picture: profilePicture,
    };

    try {
      const result = await patchRequest<{ picture: string }, User>({
        url: `/api/users/${user.id}`,
        token,
        payload,
      });

      if (result.data) {
        console.log("UPDATED USER", result.data);

        updateUser(result.data);

        return result.data;
      }

      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async function addPorperty() {
    if (!user) {
      console.error("Utilisateur non connecté");
      return;
    }
console.log("ADD PROPERTY - user =", user);
    const data = {
      ...formData,
      cover,
      profile,
      pictures: images,
    };

    const zodValidation = newPropertySchema.safeParse(data);

    if (!zodValidation.success) {
      setErrors(zodValidation.error.issues);
      console.log(zodValidation.error.issues);
      return;
    }

    const pictures: {
      file: File;
      purpose: "property-cover" | "user-picture" | "property-picture";
    }[] = [];

    if (data.cover) {
      pictures.push({
        file: data.cover,
        purpose: "property-cover",
      });
    }

    if (data.profile) {
      pictures.push({
        file: data.profile,
        purpose: "user-picture",
      });
    }

    data.pictures.forEach((picture) => {
      if (picture) {
        pictures.push({
          file: picture,
          purpose: "property-picture",
        });
      }
    });

    const token = Cookies.get("token");

    const pictureUrls = await getPictureUrls(pictures, token);

    let coverPicture = "";
    let profilePicture = user.picture ?? "";
    const propertyPictures: string[] = [];

    pictureUrls.forEach((picture) => {
      switch (picture.purpose) {
        case "property-cover":
          coverPicture = picture.url;
          break;

        case "user-picture":
          profilePicture = picture.url;
          break;

        case "property-picture":
          propertyPictures.push(picture.url);
          break;
      }
    });

    // Si une nouvelle photo de profil a été fournie,
    // on met à jour le profil
    if (profilePicture !== (user.picture ?? "")) {
      const updatedUser = await updateProfilePicture(profilePicture);

      if (updatedUser?.picture) {
        profilePicture = updatedUser.picture;
      }
    }

    const payload: CreatePropertyPayload = {
      title: data.title.charAt(0) + data.title.slice(1).trim(),
      description:
        data.description.charAt(0) + data.description.slice(1).trim(),
      cover: coverPicture,
      location: data.location.charAt(0) + data.location.slice(1).trim(),
      price_per_night: Number(data.price_per_night),
      host_id: user.id,
      host: {
        name: user.name,
        picture: profilePicture,
      },
      pictures: propertyPictures,
      equipments: data.equipments,
      tags: data.categories,
    };

    console.log(JSON.stringify(payload));

    try {
      const result = await postRequest<Property, CreatePropertyPayload>({
        url: `/api/properties`,
        payload,
        token,
      });

      console.log(result);

      localStorage.setItem(
          "flash",
          JSON.stringify({
            type: "success",
            message:
              "Votre logement a bien été enregistré",
          }),
        );
        //setApiError("");
        setErrors([]);
        setFormData(initFormData);
        router.push("/");

    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la propriété :", error);
    }
  }

  // Update rôle utilisateur client->owner si ce n'est pas déjà fait et placement en cookies du nouveau token
  useEffect(() => {
    if (user?.role === "client") {
      const changeRole = async () => {
        const payload: { role: "owner" } = {
          role: "owner",
        };
        try {
          const result = await patchRequest<
            { role: "owner" },
            { token: string }
          >({
            url: `/api/users/${user.id}`,
            token,
            payload,
          });
          if (result.data) {
            const newToken = result.data.token;
            Cookies.set("token", newToken);
          }
        } catch (error) {
          console.error(error);
        }
      };

      changeRole();
    }
  }, [user]);

  // Chargement de nom de l'utilisateur dans le formulaire
  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({ ...prev, name: user.name }));
  }, [user]);

  // Chargement des tags
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

  useEffect(() => {
  console.log("USER DANS Addproperty :", user);
  console.log("USER.NAME :", user?.name);
}, [user]);

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
                getFieldError("price_per_night")
                  ? "price_per_night-error"
                  : undefined
              }
              aria-invalid={getFieldError("price_per_night") ? "true" : "false"}
              className={
                getFieldError("price_per_night") ? styles.inputOnError : ""
              }
            />
            {getFieldError("price_per_night") && (
              <p
                id="price_per_night-error"
                className={styles.fieldError}
                role="alert"
              >
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
                  required
                  aria-describedby={
                    getFieldError("cover") ? "cover-error" : undefined
                  }
                  aria-invalid={getFieldError("cover") ? "true" : "false"}
                  className={getFieldError("cover") ? styles.inputOnError : ""}
                />
                {getFieldError("cover") && (
                  <p
                    id="cover-error"
                    className={styles.fieldError}
                    role="alert"
                  >
                    {getFieldError("cover")?.message}
                  </p>
                )}
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
                  name="cover"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={handleCoverChange}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
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
                  disabled
                  onChange={handleInputValue}
                  value={formData.name ?? ""}
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
                <label htmlFor="profileFileName">Photo de profil</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="profileFileName"
                    type="text"
                    name="profile"
                    value={profileFileName}
                    readOnly
                    aria-label="Photo de profil sélectionnée"
                  />
                  {getFieldError("profile") && (
                    <p
                      id="profile-error"
                      className={styles.fieldError}
                      role="alert"
                    >
                      {getFieldError("profile")?.message}
                    </p>
                  )}

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
        <section className={styles.equipments}>
          <h2 className={styles.sectionLabel}>Équipements</h2>
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
            {getFieldError("equipments") && (
              <p
                id="equipments-error"
                className={styles.fieldError}
                role="alert"
              >
                {getFieldError("equipments")?.message}
              </p>
            )}
          </div>
        </section>
        <section className={styles.categories}>
          <h2 className={styles.sectionLabel}>Catégories</h2>
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
        </section>
      </form>
    </>
  );
}
