"use client";

import styles from "./PropertyCard.module.css";
import type { Property, FlashMessageType } from "@/app/types/types";
import Image from "next/image";
import Link from "next/link";
import postRequest from "@/app/utils/postRequest";
import deleteRequest from "@/app/utils/deleteRequest";
import Cookies from "js-cookie";
import { useFavorites } from "@/app/context/FavoritesContext";
import FlashMessage from "../FlashMessage/FlashMessage";
import { useState } from "react";
import formatUrl from "@/app/utils/formatUrl";
import { apiUrl } from "@/app/utils/api";

type PropertyCardProps = {
  property: Property;
};

/**
 * Affiche une carte de logement avec ses principales informations.
 *
 * Permet également d'ajouter ou de retirer le logement des favoris.
 * Une notification est affichée lorsque l'utilisateur tente d'ajouter
 * un favori sans être connecté.
 *
 * @param property - Logement dont les informations sont affichées.
 */
export default function PropertyCard({ property }: PropertyCardProps) {
  const token = Cookies.get("token");
  const [flashMessage, setFlashMessage] = useState<FlashMessageType | null>(
    null,
  );
  const { favoriteIds, addFavorite, removeFavorite } = useFavorites();

  if (!property.id) {
    return null;
  }

  const propertyId = property.id;
  const isFavorite = favoriteIds.includes(propertyId);

  /**
   * Ajoute ou retire le logement des favoris selon son état actuel.
   *
   * Si l'utilisateur n'est pas connecté, une notification lui demande
   * de se connecter avant de poursuivre.
   */
  async function toggleFavorite() {
    if (!token) {
      setFlashMessage({
        status: false,
        message: "Vous devez être connecté.e pour ajouter un favori",
      });
      return;
    }

    if (!isFavorite) {
      try {
        const result = await postRequest({
          url: apiUrl(`/api/properties/${propertyId}/favorite`),
          token,
        });

        if (result.data) {
          addFavorite(propertyId);
        }
      } catch (error) {
        console.error(error);
      }

      return;
    }

    try {
      const result = await deleteRequest({
        url: apiUrl(`/api/properties/${propertyId}/favorite`),
        token,
      });

      if (result.data) {
        removeFavorite(propertyId);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <article className={styles.card}>
      <Link
        href={`/logement/${propertyId}`}
        className={styles.propertyLink}
        data-focusable="property-link"
      >
        <div className={styles.pictureContainer}>
          <Image
            src={formatUrl(property.cover)}
            alt={`Photo du logement : ${property.title}`}
            fill
          />
        </div>

        <div className={styles.cardData}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>{property.title}</h2>

            <p className={styles.cardDescription}>{property.location}</p>
          </div>

          <p>
            <span className={styles.price}>{property.price_per_night} €</span>

            <span className={styles.label}> par nuit</span>
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
          src={isFavorite ? "/pictures/heart-red.svg" : "/pictures/heart.svg"}
          alt=""
          width={24}
          height={24}
          aria-hidden="true"
        />
      </button>

      {flashMessage && (
        <FlashMessage
          status={flashMessage.status}
          message={flashMessage.message}
        />
      )}
    </article>
  );
}