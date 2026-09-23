"use client";

import { useEffect, useState } from "react";
import getRequest from "./utils/getRequest";
import type { Property, FlashMessageType } from "./types/types";
import Loader from "./components/Loader/Loader";
import PropertyCard from "./components/PropertyCard/PropertyCard";
import Tile from "./components/Tile/Tile";
import styles from "./page.module.css";
import FlashMessage from "./components/FlashMessage/FlashMessage";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [visibleCards, setVisibleCards] = useState(6);
  const [flash, setFlash] = useState<FlashMessageType | null>(null);

  const loadMoreProperties = () => {
    setVisibleCards((prev) => prev + 6);
  };

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const properties = await getRequest<Property[]>({
          url: "/api/properties",
        });

        setProperties(properties);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

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
      <div className={styles.homeWrapper}>
        {flash && (
          <FlashMessage status={flash.status} message={flash.message} />
        )}
        <section className={styles.hero}>
          <h1>Chez vous, partout et ailleurs</h1>

          <p>
            Avec Kasa, vivez des séjours uniques dans des hébergements
            chaleureux, sélectionnés avec soin par nos hôtes.
          </p>

          <div className={styles.heroPictureContainer}>
            <img src="/pictures/hero.png" alt="" />
          </div>
        </section>

        {loading && (
          <div
            role="status"
            aria-live="polite"
            aria-label="chargement des logements"
          >
            <Loader />
            <span className="sr-only">Chargement des logements…</span>
          </div>
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

        <section className={styles.explanations}>
          <h2>Comment ça marche ?</h2>

          <p>
            Que vous partiez pour un week-end improvisé, des vacances en famille
            ou un voyage professionnel, <br />
            Kasa vous aide à trouver un lieu qui vous ressemble.
          </p>

          <div className={styles.tiles}>
            <Tile
              title="Recherchez"
              description="Entrez votre destination, vos dates et laissez Kasa faire le reste"
            />

            <Tile
              title="Réservez"
              description="Profitez d’une plateforme sécurisée et de profils d’hôtes vérifiés."
            />

            <Tile
              title="Vivez l'expérience"
              description="Installez-vous, profitez de votre séjour, et sentez-vous chez vous, partout."
            />
          </div>
        </section>
      </div>
    </>
  );
}
