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

  useEffect(() => {
    // Pas connecté → aucun favori
    if (!user) {
      setFavoriteIds([]);
      return;
    }

    const userId = user.id

    async function fetchFavorites() {
      const token = Cookies.get("token");

      if (!token) {
        setFavoriteIds([]);
        return;
      }

      try {
        const result = await getRequest<Property[]>({
          url: apiUrl(`/api/users/${userId}/favorites`),
          token,
        });

        const ids = result
          .map((favorite) => favorite.id)
          .filter((id): id is string => id !== undefined);

        setFavoriteIds(ids);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des favoris :",
          error
        );

        setFavoriteIds([]);
      }
    }

    fetchFavorites();
  }, [user]);

  function addFavorite(id: string) {
    setFavoriteIds((prev) => {
      if (prev.includes(id)) {
        return prev;
      }

      return [...prev, id];
    });
  }

  function removeFavorite(id: string) {
    setFavoriteIds((prev) =>
      prev.filter((favoriteId) => favoriteId !== id)
    );
  }

  function clearFavorites() {
    setFavoriteIds([]);
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
