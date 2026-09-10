"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { equipements } from "../data/equipments";
import getRequest from "../utils/getRequest";
import Tag from "../components/Tag/Tag";
import { ChangeEvent } from "react";
import type { PropertyFormData } from "../types/types";

export default function Addproperty() {
  function addPorperty() {
    const data = {
      ...formData,
      cover: cover,
      profile: profile,
      pictures: images,
    };

    console.log("FORMDATA", data);
  }

  const [cover, setCover] = useState<File | null>(null);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [profile, setProfile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  //const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getRequest<string[]>("api/tags");
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
        
      </section>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          addPorperty();
        }}
      >
        <div className={styles.top}>
          <h1>Ajouter une propriété</h1>
          <button type="submit">Ajouter</button>
        </div>
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
            />
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
            />
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
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="location">Localisation</label>
            <input
              type="text"
              id="location"
              name="location"
              onChange={handleInputValue}
              required
            />
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
                <label htmlFor="coverImage" className={styles.addButton}>
                  <span aria-hidden="true">+</span>
                  <span className={styles.srOnly}>
                    Choisir une image de couverture
                  </span>
                </label>
                <input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleCoverChange}
                />
              </div>

              {/* Images du logement */}
              <label htmlFor="propertyPictures">Images du logement</label>

              {images?.map((image, index) => (
                <div className={styles.formGroup} key={index}>
                  <div className={styles.inputWrapper}>
                    <input
                      id="propertyPictures"
                      type="text"
                      value={image?.name || ""}
                      readOnly
                    />

                    <label
                      htmlFor={`image-${index}`}
                      className={styles.addButton}
                    >
                      <span aria-hidden="true">+</span>
                      <span className={styles.srOnly}>
                        Choisir une image du logement
                      </span>
                    </label>

                    <input
                      id={`image-${index}`}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleImageChange(index, e)}
                    />
                  </div>
                </div>
              ))}

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
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="profilePicture">Photo de profil</label>

                <div className={styles.inputWrapper}>
                  <input
                    id="profilePicture"
                    type="text"
                    value={profile?.name || ""}
                    onChange={handleInputValue}
                    readOnly
                  />

                  <label htmlFor="profile" className={styles.addButton}>
                    <span aria-hidden="true">+</span>
                    <span className={styles.srOnly}>
                      Choisir une photo de profil
                    </span>
                  </label>

                  <input
                    id="profile"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleProfileChange(e)}
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
