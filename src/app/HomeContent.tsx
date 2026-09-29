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

export default function HomeContent({ properties }: HomeContentProps) {
  const [visibleCards, setVisibleCards] = useState(6);
  const [flash, setFlash] = useState<FlashMessageType | null>(null);
  const loadMoreProperties = () => {
    setVisibleCards((prev) => prev + 6);
  };
  const [focusables, setFocusables] = useState<NodeListOf<HTMLAnchorElement>>();
  const [hasFocus, setHasFocus] = useState<HTMLAnchorElement | null>(null);

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

  useEffect(() => {
    const focusablesCards = getFocusableElements();
    setFocusables(focusablesCards);
  }, [visibleCards]);

  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLAnchorElement)) return;

      const isFocusable = Array.from(focusables ?? []).some(
        (element) => element === target,
      );

      if (isFocusable) {
        setHasFocus(target);
      }
    };
    document.addEventListener("focusin", handleFocus);

    return () => {
      document.removeEventListener("focusin", handleFocus);
    };
  }, [focusables]);

  useEffect(() => {
    if (!hasFocus) return
    const focusableStillExists = document.contains(hasFocus);
    if (focusableStillExists) {
      hasFocus.focus();
    }
  }, [focusables]);

  return (
    <>
      {flash && <FlashMessage status={flash.status} message={flash.message} />}

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
