"use client";

import styles from "./page.module.css";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "../components/Loader/Loader";
import type { Property } from "../types/types";
import PropertyCard from "../components/PropertyCard/PropertyCard";
import getRequest from "../utils/getRequest";
import { apiUrl } from "../utils/api";

/**
 * Affiche la liste des logements enregistrés dans les favoris de l'utilisateur.
 *
 * Vérifie l'authentification, récupère les favoris depuis l'API et les affiche
 * sous forme de cartes. Un utilisateur non connecté est redirigé vers la page
 * de connexion.
 */
export default function Favorites() {
  const router = useRouter();

  const [token] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[] | []>([]);

  /**
   * Vérifie l'authentification de l'utilisateur et récupère ses favoris.
   */
  useEffect(() => {
    async function loadFavorites() {
      const token = Cookies.get("token");
      const userCookie = Cookies.get("user");

      if (!token) {
        router.replace("/connexion");
        return;
      }

      if (userCookie) {
        const user = JSON.parse(userCookie);

        try {
          const result = await getRequest<Property[]>({
            url: apiUrl(`/api/users/${user.id}/favorites`),
            token,
          });

          setFavorites(result);

          const ids = result
            .map((favorite) => favorite.id)
            .filter((id): id is string => id !== undefined);

          setFavoriteIds(ids);

          // Synchronise les favoris récupérés avec le stockage local.
          localStorage.setItem("favorites", JSON.stringify(favorites));
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    }

    loadFavorites();
  }, [token]);

  if (loading) {
    return (
      <div role="status" aria-live="polite">
        <Loader />
        <span className="sr-only">Chargement des favoris…</span>
      </div>
    );
  }

  return (
    <>
      <div className={styles.banner}>
        <h1>Vos favoris</h1>

        <p>
          Retrouvez ici tous les logements que vous avez aimés.
          <br />
          Prêts à réserver ? Un simple clic et votre prochain séjour est en
          route.
        </p>
      </div>

      <section className={styles.favoritesWrapper}>
        {favorites.length === 0 ? (
          <p>Vous n&apos;avez aucun favori enregistré.</p>
        ) : (
          favorites.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))
        )}
      </section>
    </>
  );
}