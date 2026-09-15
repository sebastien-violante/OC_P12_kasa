"use client";

import styles from "./PropertyCard.module.css";
import type { Property } from "@/app/types/types";
import Image from "next/image";
import Link from "next/link";
import postRequest from "@/app/utils/postRequest";
import deleteRequest from "@/app/utils/deleteRequest";
import Cookies from "js-cookie";
import { useFavorites } from "@/app/context/FavoritesContext";

type PropertyCardProps = {
  property: Property;
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const token = Cookies.get("token");

  const { favoriteIds, addFavorite, removeFavorite } = useFavorites();

  const isFavorite = favoriteIds.includes(property.id);

  async function toggleFavorite() {
    if (!token) {
      alert("Vous devez être connecté pour ajouter un logement aux favoris.");
      return;
    }

    if (!isFavorite) {
      try {
        const result = await postRequest({
          url: `/api/properties/${property.id}/favorite`,
          token,
        });

        if (result.data) {
          addFavorite(property.id);
        }
      } catch (error) {
        console.error(error);
      }

      return;
    }

    try {
      const result = await deleteRequest({
        url: `/api/properties/${property.id}/favorite`,
        token,
      });

      if (result.data) {
        removeFavorite(property.id);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <article className={styles.card}>
      <Link
        href={`/property/${property.id}`}
        className={styles.propertyLink}
      >
        <div className={styles.pictureContainer}>
          <Image
            src={property.cover}
            alt={`Photo du logement : ${property.title}`}
            fill
          />
        </div>

        <div className={styles.cardData}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              {property.title}
            </h2>

            <p className={styles.cardDescription}>
              {property.location}
            </p>
          </div>

          <p>
            <span className={styles.price}>
              {property.price_per_night} €
            </span>

            <span className={styles.label}>
              {" "}
              par nuit
            </span>
          </p>
        </div>
      </Link>

      <button
        type="button"
        className={styles.favorite}
        onClick={toggleFavorite}
        aria-label={
          isFavorite
            ? `Retirer ${property.title} des favoris`
            : `Ajouter ${property.title} aux favoris`
        }
        aria-pressed={isFavorite}
      >
        <Image
          src={
            isFavorite
              ? "/pictures/heart-red.svg"
              : "/pictures/heart.svg"
          }
          alt=""
          width={24}
          height={24}
          aria-hidden="true"
        />
      </button>
    </article>
  );
}