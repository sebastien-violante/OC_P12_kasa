"use client";

import { useEffect, useState } from "react";
import type { Property, FlashMessageType } from "./types/types";
import PropertyCard from "./components/PropertyCard/PropertyCard";
import FlashMessage from "./components/FlashMessage/FlashMessage";
import styles from './page.module.css'

type HomeContentProps = {
  properties: Property[];
};

export default function HomeContent({ properties }: HomeContentProps) {
  const [visibleCards, setVisibleCards] = useState(6);
  const [flash, setFlash] = useState<FlashMessageType | null>(null);

  const loadMoreProperties = () => {
    setVisibleCards((prev) => prev + 6);
  };

  useEffect(() => {
    const flashBag = localStorage.getItem("flash");

    if (flashBag) {
      const parsedFlashBag = JSON.parse(flashBag);

      setFlash({
        status: parsedFlashBag.type,
        message: parsedFlashBag.message,
      });

      localStorage.removeItem("flash");
    }
  }, []);

  return (
    <>
      {flash && (
        <FlashMessage status={flash.status} message={flash.message} />
      )}

      <section
        className={styles.cardWrapper}
        aria-labelledby="properties-title"
      >
        <h2 id="properties-title" className="sr-only">
          Nos logements
        </h2>

        {properties.slice(0, visibleCards).map((property) => (
          <PropertyCard property={property} key={property.slug} />
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