"use client";

import styles from "./page.module.css";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "../components/Loader/Loader";
import getRequest from "../utils/getRequest";
import type { Property } from "../types/types";

export default function Favorites() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Property[]>([]);

  // Récupération des informations d'authentification
  useEffect(() => {
    const storedToken = Cookies.get("token");
    const storedUserId = localStorage.getItem("userId");

    if (!storedToken) {
      router.replace("/connexion");
      return;
    }

    if (!storedUserId) {
      router.replace("/404");
      return;
    }

    setToken(storedToken);
    setUserId(storedUserId);
  }, [router]);

  // Récupération des favoris
  useEffect(() => {
    if (!token || !userId) {
      return;
    }

    async function loadFavorites() {
      try {
        const result = await getRequest<Property[]>({
          url: `/api/users/${userId}/favorites`,
          token,
        });

        console.log("Favoris :", result);
        setFavorites(result);
      } catch (error) {
        console.error("Erreur lors du chargement des favoris :", error);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [token, userId]);

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
            
            <div key={property.slug}>{property.title}</div>
          ))
        )}
      </section>
    </>
  );
}