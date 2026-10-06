"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import getRequest from "../utils/getRequest";
import Tag from "../components/Tag/Tag";
import { ChangeEvent } from "react";
import type {
  CreatePropertyPayload,
  PropertyFormData,
  ApiError,
} from "../types/types";
import z from "zod";
import { newPropertySchema } from "../types/schemas/newPropertySchema";
import { useAuth } from "../context/AuthContext";
import Cookies from "js-cookie";
import patchRequest from "../utils/patchRequest";
import postRequest from "../utils/postRequest";
import getPictureUrls from "../utils/getPictureUrls";
import type { Property, User } from "../types/types";
import { useRouter } from "next/navigation";
import { apiUrl } from "../utils/api";

/**
 * Page de création d'un nouveau logement.
 *
 * Gère la saisie du formulaire, la sélection des images, la validation
 * des données, la mise à jour éventuelle du profil de l'hôte et la création
 * du logement auprès de l'API.
 */
export default function AddProperty() {
  const token = Cookies.get("token");
  const router = useRouter();

  const [cover, setCover] = useState<File | null>(null);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [profile, setProfile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [equipements, setEquipments] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pictureInputRef = useRef<(HTMLInputElement | null)[]>([]);

  const [errors, setErrors] = useState<z.core.$ZodIssue[]>([]);
  const [profileFileName, setProfileFileName] = useState("");
  const { user, updateUser } = useAuth();
  const [apiError, setApiError] = useState("");
  const [pictureQuantity, setPictureQuantity] = useState(1);
  const [isSubmiting, setIsSubmiting] = useState(false);

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

  /**
   * Synchronise le nom de l'hôte avec l'utilisateur actuellement connecté.
   */
  useEffect(() => {
    if (!user) return;

    setFormData((prev) => {
      if (prev.name === user.name) {
        return prev;
      }

      return {
        ...prev,
        name: user.name,
      };
    });
  }, [user]);

  /**
   * Gère les modifications des champs du formulaire.
   *
   * Les cases à cocher permettent de gérer les équipements.
   * Le code postal et le prix sont filtrés afin de ne conserver
   * que les caractères numériques.
   *
   * @param event Événement déclenché par la modification d'un champ.
   */
  function handleInputValue(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
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

    if (target.name === "postalCode") {
      const postalCode = target.value.replace(/[^0-9]/g, "").slice(0, 5);

      setFormData((prev) => ({
        ...prev,
        postalCode,
      }));

      return;
    }

    if (target.name === "price_per_night") {
      const price_per_night = target.value.replace(/[^0-9]/g, "");

      setFormData((prev) => ({
        ...prev,
        price_per_night,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [target.name]: target.value,
    }));
  }

  /**
   * Met à jour l'image de couverture sélectionnée.
   *
   * @param event Événement provenant du champ de sélection de fichier.
   */
  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setCover(file);
  }

  /**
   * Met à jour la photo de profil sélectionnée.
   *
   * @param event Événement provenant du champ de sélection de fichier.
   */
  function handleProfileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setProfile(file);
    setProfileFileName(file.name);
  }

  /**
   * Met à jour une image spécifique du logement.
   *
   * @param index Index de l'image à modifier.
   * @param event Événement provenant du champ de sélection de fichier.
   */
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

  /**
   * Met à jour la valeur de la nouvelle catégorie personnalisée.
   *
   * @param value Valeur saisie par l'utilisateur.
   */
  function handleNewTagChange(value: string) {
    setNewTag(value);
  }

  /**
   * Ajoute une nouvelle catégorie personnalisée au formulaire.
   */
  function handleAddTag() {
    const formatedTag = newTag.charAt(0).toUpperCase() + newTag.slice(1).trim();

    if (!formatedTag) return;

    setTags((prev) => [...prev, formatedTag]);

    setFormData((prev) => ({
      ...prev,
      categories: [...prev.categories, formatedTag],
    }));

    setNewTag("");
  }

  /**
   * Sélectionne ou désélectionne une catégorie.
   *
   * @param tag Catégorie à sélectionner ou désélectionner.
   */
  function handleTagToggle(tag: string) {
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
  }

  /**
   * Ajoute un nouvel emplacement pour une image supplémentaire.
   *
   * Le formulaire est limité à quatre images supplémentaires.
   */
  function addImage() {
    if (pictureQuantity < 4) {
      setPictureQuantity((prev) => prev + 1);
      setImages((prev) => [...prev, null]);
    }
  }

  /**
   * Retourne l'erreur de validation associée à un champ.
   *
   * @param fieldName Nom du champ recherché.
   * @returns L'erreur correspondante ou undefined.
   */
  function getFieldError(fieldName: string) {
    return errors.find((error) => error.path.includes(fieldName));
  }

  /**
   * Met à jour la photo de profil de l'utilisateur.
   *
   * @param profilePicture URL de la nouvelle photo de profil.
   * @returns L'utilisateur mis à jour ou null en cas d'échec.
   */
  async function updateProfilePicture(profilePicture: string) {
    if (!user) {
      return null;
    }

    const payload = {
      picture: profilePicture,
    };

    try {
      const result = await patchRequest<{ picture: string }, User>({
        url: apiUrl(`/api/users/${user.id}`),
        token,
        payload,
      });

      if (result.data) {
        updateUser(result.data);

        return result.data;
      }

      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Valide les données du formulaire puis crée le logement.
   *
   * Cette fonction gère également l'upload des images et la mise à jour
   * éventuelle de la photo de profil de l'hôte avant la création du logement.
   */
  async function addProperty() {
    if (!user) {
      console.error("Utilisateur non connecté");
      return;
    }

    const data = {
      ...formData,
      cover,
      profile,
      pictures: images,
    };

    // Validation des données avant l'envoi à l'API.
    const zodValidation = newPropertySchema.safeParse(data);

    if (!zodValidation.success) {
      setErrors(zodValidation.error.issues);
      return;
    }

    setIsSubmiting(true);

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

    try {
      // Upload des images afin de récupérer leurs URLs.
      const pictureUrls = await getPictureUrls(pictures, token);

      let coverPicture = "";
      let profilePicture = user.picture ?? "";
      const propertyPictures: string[] = [];

      // Répartition des URLs selon leur utilisation.
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

      // Mise à jour de la photo de profil si une nouvelle image a été fournie.
      if (profilePicture !== (user.picture ?? "")) {
        const updatedUser = await updateProfilePicture(profilePicture);

        if (updatedUser?.picture) {
          profilePicture = updatedUser.picture;
        }
      }

      // Construction des données envoyées à l'API.
      const payload: CreatePropertyPayload = {
        title: data.title.charAt(0).toUpperCase() + data.title.slice(1).trim(),
        description:
          data.description.charAt(0).toUpperCase() +
          data.description.slice(1).trim(),
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

      try {
        // Création du logement.
        await postRequest<Property, CreatePropertyPayload>({
          url: apiUrl(`/api/properties`),
          payload,
          token,
        });

        localStorage.setItem(
          "flash",
          JSON.stringify({
            type: "success",
            message: "Votre logement a bien été enregistré",
          }),
        );

        setErrors([]);
        setFormData(initFormData);
        router.push("/");
      } catch (error) {
        const apiError = error as ApiError;

        if (apiError.status === 403) {
          setApiError(
            "Vous n'avez pas les droits nécessaires pour créer un logement",
          );
        } else {
          setApiError(apiError.message);
        }
      }
    } catch (error) {
      const apiError = error as ApiError;
      setApiError(apiError.message);
    } finally {
      setIsSubmiting(false);
    }
  }

  /**
   * Transforme le rôle d'un utilisateur "client" en "owner"
   * afin qu'il puisse créer un logement.
   * Le nouveau token fourni par l'API est enregistré dans les cookies.
   */
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
            url: apiUrl(`/api/users/${user.id}`),
            token,
            payload,
          });
console.log("🟠 CHANGE ROLE RESPONSE :", result.data);
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

  /**
   * Récupère les catégories disponibles depuis l'API au chargement
   * de la page.
   */
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getRequest<string[]>({
          url: apiUrl("/api/tags"),
        });

        setTags(tags);
      } catch (error) {
        console.error(error);
      }
    };

    loadTags();
  }, []);

  /**
   * Récupère les équipements disponibles depuis l'API au chargement
   * de la page.
   */
  useEffect(() => {
    const loadEquipements = async () => {
      try {
        const equipements = await getRequest<string[]>({
          url: apiUrl("/api/equipments"),
        });

        setEquipments(equipements);
      } catch (error) {
        console.error(error);
      }
    };

    loadEquipements();
  }, []);

  return (
    <>
      <section className={styles.header}>
        <Link href="/" className={styles.backToProperties}>
          <img src="/pictures/back-arrow.svg" alt="" />
          <span className="md:hidden">Retour aux annonces</span>
          <span className="hidden md:inline">Retour</span>
        </Link>

        <h1>Ajouter une propriété</h1>

        {apiError && (
          <p id="api-error" role="alert" className={styles.apiError}>
            {apiError}
          </p>
        )}
      </section>

      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          addProperty();
        }}
        noValidate
      >
        <button
          type="submit"
          className={styles.submitBtn}
          aria-label="Ajouter la propriété"
          disabled={isSubmiting}
          aria-busy={isSubmiting}
        >
          {isSubmiting ? "Ajout en cours…" : "Ajouter"}
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
              value={formData.postalCode}
              onChange={handleInputValue}
              required
              aria-describedby={
                getFieldError("postalCode") ? "postalCode-error" : undefined
              }
              aria-invalid={getFieldError("postalCode") ? "true" : "false"}
              className={
                getFieldError("postalCode") ? styles.inputOnError : ""
              }
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
            <label htmlFor="price_per_night">Prix par nuitée (€)</label>
            <input
              type="text"
              id="price_per_night"
              name="price_per_night"
              inputMode="numeric"
              value={formData.price_per_night}
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
              <p className={styles.groupLabel}>Image de couverture</p>

              <div className={styles.inputWrapper}>
                <span id="coverFileName" className={styles.fileName}>
                  {cover?.name || ""}
                </span>

                {getFieldError("cover") && (
                  <p
                    id="cover-error"
                    className={styles.fieldError}
                    role="alert"
                  >
                    {getFieldError("cover")?.message}
                  </p>
                )}

                <label
                  htmlFor="coverImage"
                  className={styles.addButton}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      coverInputRef.current?.click();
                    }
                  }}
                >
                  <span className="sr-only">
                    Choisir une image de couverture
                  </span>
                  <span className={styles.span} aria-hidden="true">+</span>
                </label>

                <input
                  ref={coverInputRef}
                  id="coverImage"
                  name="cover"
                  type="file"
                  tabIndex={-1}
                  accept="image/jpeg,image/png,image/webp"
                  aria-describedby={
                    getFieldError("cover") ? "cover-error" : undefined
                  }
                  aria-invalid={getFieldError("cover") ? "true" : "false"}
                  className={styles.visuallyHidden}
                  onChange={handleCoverChange}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <p className={styles.groupLabel}>Images du logement</p>

              {images?.map((image, index) => {
                const inputId = `propertyPicture-${index}`;

                return (
                  <div className={styles.formGroup} key={index}>
                    <div className={styles.inputWrapper}>
                      <span
                        id={`${inputId}-name`}
                        className={styles.fileName}
                      >
                        {image?.name || ""}
                      </span>

                      <label
                        htmlFor={inputId}
                        className={styles.addButton}
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            event.preventDefault();
                            pictureInputRef.current[index]?.click();
                          }
                        }}
                      >
                        <span className="sr-only">
                          Choisir la photo du logement {index + 1}
                        </span>
                        <span aria-hidden="true" className={styles.span}>+</span>
                      </label>

                      <input
                        id={inputId}
                        type="file"
                        tabIndex={-1}
                        accept="image/*"
                        className={styles.visuallyHidden}
                        onChange={(e) => handleImageChange(index, e)}
                        ref={(element) => {
                          pictureInputRef.current[index] = element;
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {pictureQuantity < 4 && (
                <button
                  type="button"
                  className={styles.addImage}
                  onClick={addImage}
                >
                  +Ajouter une image
                </button>
              )}
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
                  tabIndex={-1}
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
                <p className={styles.groupLabel}>Photo de profil</p>

                <div className={styles.inputWrapper}>
                  <span id="profileFileName" className={styles.fileName}>
                    {profileFileName || ""}
                  </span>

                  {getFieldError("profile") && (
                    <p
                      id="profile-error"
                      className={styles.fieldError}
                      role="alert"
                    >
                      {getFieldError("profile")?.message}
                    </p>
                  )}

                  <label
                    htmlFor="profile"
                    className={styles.addButton}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        profileInputRef.current?.click();
                      }
                    }}
                  >
                    <span className="sr-only">
                      Choisir une photo de profil
                    </span>
                    <span aria-hidden="true" className={styles.span}>+</span>
                  </label>

                  <input
                    ref={profileInputRef}
                    id="profile"
                    tabIndex={-1}
                    type="file"
                    name="profile"
                    accept="image/*"
                    aria-describedby={
                      getFieldError("profile") ? "profile-error" : undefined
                    }
                    aria-invalid={getFieldError("profile") ? "true" : "false"}
                    className={styles.visuallyHidden}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </article>

        <section
          className={`${styles.equipments} ${
            getFieldError("equipments") ? styles.inputOnError : ""
          }`}
        >
          <h2 className={styles.sectionLabel}>Équipements</h2>

          {getFieldError("equipments") && (
            <p id="equipments-error" className={styles.fieldError} role="alert">
              {getFieldError("equipments")?.message}
            </p>
          )}

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

          <label htmlFor="newTag">
            Ajouter une catégorie personnalisée
          </label>

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
                <span aria-hidden="true" className={styles.span}>+</span>
              </button>
            </div>
          </div>
        </section>
      </form>
    </>
  );
}