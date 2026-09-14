"use client";

import styles from "./PropertyCard.module.css";
import type { Property } from "@/app/types/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import postRequest from "@/app/utils/postRequest";
import Cookies from "js-cookie";
import { useFavorites } from "@/app/context/FavoritesContext";

type PropertyCardProps = {
  property: Property;
};

export default function PropertyCard({
  property,
}: PropertyCardProps) {
  const router = useRouter();
  const token = Cookies.get("token");

  const {
    favoriteIds,
    addFavorite,
    removeFavorite,
  } = useFavorites();

  const isFavorite = favoriteIds.includes(property.id);

  async function toggleFavorite(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.stopPropagation();

    if (!token) {
      alert("pas connecté");
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

    // TODO : faire ici ton DELETE
    // await deleteRequest(...)

    removeFavorite(property.id);
  }

  return (
    <article className={styles.card}>
      <div
        onClick={() =>
          router.push(`/property/${property.id}`)
        }
      >
        <div className={styles.pictureContainer}>
          <Image
            src={property.cover}
            alt={`photo du logement ${property.title}`}
            fill
          />
        </div>

        <div className={styles.cardData}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              {property.title}
            </h2>

            <p>
              {isFavorite ? "Favori" : "non"}
            </p>

            <p className={styles.cardDescription}>
              {property.location}
            </p>
          </div>

          <p>
            <span className={styles.price}>
              {property.price_per_night}€
            </span>

            <span className={styles.label}>
              {" "}par nuit
            </span>
          </p>
        </div>

        <button
          type="button"
          className={styles.favorite}
          onClick={toggleFavorite}
        >
          <img
            alt=""
            src={
              isFavorite
                ? "/pictures/heart-red.svg"
                : "/pictures/heart.svg"
            }
          />
        </button>
      </div>
    </article>
  );
}