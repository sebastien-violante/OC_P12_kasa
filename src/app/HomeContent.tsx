"use client";

import { useEffect, useState } from "react";
import type { Property, FlashMessageType } from "./types/types";
import PropertyCard from "./components/PropertyCard/PropertyCard";
import FlashMessage from "./components/FlashMessage/FlashMessage";
import styles from "./page.module.css";
import { getFocusableElements } from "./utils/getFocusableElements";

type HomeContentProps = {
  properties: Property[];
};

/**
 * Affiche la liste des logements disponibles sur la page d'accueil.
 *
 * Le composant gère :
 * - l'affichage progressif des logements ;
 * - la récupération et l'affichage d'un message flash ;
 * - le déplacement du focus clavier vers la première carte d'un nouveau lot.
 *
 * @param {HomeContentProps} props Propriétés nécessaires au rendu du composant.
 * @param {Property[]} props.properties Liste des logements à afficher.
 *
 * @returns {JSX.Element} La section contenant les cartes de logements.
 */
export default function HomeContent({
  properties,
}: HomeContentProps) {
  const [visibleCards, setVisibleCards] = useState(6);
  const [flash, setFlash] = useState<FlashMessageType | null>(null);

  // Mémorise l'index de la première carte ajoutée lors du prochain affichage.
  const [newCardsStartIndex, setNewCardsStartIndex] = useState<number | null>(
    null,
  );

  /**
   * Affiche six logements supplémentaires.
   *
   * L'index de la première nouvelle carte est mémorisé afin de pouvoir
   * déplacer le focus dessus une fois que le DOM a été mis à jour.
   */
  const loadMoreProperties = () => {
    setNewCardsStartIndex(visibleCards);
    setVisibleCards((prev) => prev + 6);
  };

  // Récupération du message flash éventuellement transmis par une autre page.
  useEffect(() => {
    const flashBag = localStorage.getItem("flash");
localStorage.removeItem('favorites')
localStorage.removeItem('favorites_undefined')
    if (flashBag) {
      const parsedFlashBag = JSON.parse(flashBag);

      setFlash({
        status: parsedFlashBag.type,
        message: parsedFlashBag.message,
      });

      // Le message ne doit être affiché qu'une seule fois.
      localStorage.removeItem("flash");
    }
  }, []);

  // Repositionnement sur la première nouvelle carte du focus en cas de chargement d'un nouveau lot de cartes
  useEffect(() => {
    if (newCardsStartIndex === null) return;

    const focusableCards = getFocusableElements();
    const firstNewCard = focusableCards[newCardsStartIndex];

    if (firstNewCard) {
      firstNewCard.focus();
    }

    // Le déplacement du focus ne doit avoir lieu qu'après un ajout de cartes.
    setNewCardsStartIndex(null);
  }, [visibleCards, newCardsStartIndex]);

  return (
    <>
      {flash && (
        <FlashMessage
          status={flash.status}
          message={flash.message}
        />
      )}

      <section
        className={styles.cardWrapper}
        aria-labelledby="properties-title"
      >
        <h2 id="properties-title" className="sr-only">
          Nos logements
        </h2>

        {properties
          .slice(0, visibleCards)
          .map((property) => (
            <PropertyCard
              property={property}
              key={property.slug}
            />
          ))}

        {visibleCards < properties.length && (
          <button
            type="button"
            onClick={loadMoreProperties}
            className={styles.loadMore}
          >
            Voir plus de logements...
          </button>
        )}
      </section>
    </>
  );
}
