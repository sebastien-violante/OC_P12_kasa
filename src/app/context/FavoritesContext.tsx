"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import Cookies from "js-cookie";
import { apiUrl } from "../utils/api";
import type { Property } from "@/app/types/types";

import getRequest from "@/app/utils/getRequest";
import { useAuth } from "./AuthContext";

type FavoritesContextType = {
  favoriteIds: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
};

const FavoritesContext = createContext<
  FavoritesContextType | undefined
>(undefined);

export function FavoritesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Récupération des favoris depuis le localStorage
  useEffect(() => {
    if (!user) {
      setFavoriteIds([]);
      return;
    }

    const storageKey = `favorites_${user.id}`;
    const storedFavorites = localStorage.getItem(storageKey);

    if (!storedFavorites) {
      setFavoriteIds([]);
      return;
    }

    try {
      const parsedFavorites: unknown = JSON.parse(storedFavorites);

      if (Array.isArray(parsedFavorites)) {
        const ids = parsedFavorites.filter(
          (id): id is string => typeof id === "string"
        );

        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des favoris locaux :",
        error
      );

      setFavoriteIds([]);
    }
  }, [user]);

  // Synchronisation avec l'API
  useEffect(() => {
    if (!user) return;

    const userId = user.id;
    const token = Cookies.get("token");

    if (!token) return;

    async function fetchFavorites() {
      try {
        const result = await getRequest<Property[]>({
          url: apiUrl(`/api/users/${userId}/favorites`),
          token,
        });

        const ids = result
          .map((favorite) => favorite.id)
          .filter((id): id is string => id !== undefined);

        setFavoriteIds(ids);

        localStorage.setItem(
          `favorites_${userId}`,
          JSON.stringify(ids)
        );
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des favoris :",
          error
        );
      }
    }

    fetchFavorites();
  }, [user]);

  function addFavorite(id: string) {
    if (!user) return;

    setFavoriteIds((prev) => {
      if (prev.includes(id)) {
        return prev;
      }

      const updatedFavorites = [...prev, id];

      localStorage.setItem(
        `favorites_${user.id}`,
        JSON.stringify(updatedFavorites)
      );

      return updatedFavorites;
    });
  }

  function removeFavorite(id: string) {
    if (!user) return;

    setFavoriteIds((prev) => {
      const updatedFavorites = prev.filter(
        (favoriteId) => favoriteId !== id
      );

      localStorage.setItem(
        `favorites_${user.id}`,
        JSON.stringify(updatedFavorites)
      );

      return updatedFavorites;
    });
  }

  function clearFavorites() {
    if (!user) return;

    setFavoriteIds([]);
    localStorage.removeItem(`favorites_${user.id}`);
  }

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        addFavorite,
        removeFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error(
      "useFavorites doit être utilisé dans un FavoritesProvider"
    );
  }

  return context;
}