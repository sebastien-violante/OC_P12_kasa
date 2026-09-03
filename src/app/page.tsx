"use client";

import { useEffect, useState } from "react";
import getRequest from "./utils/getRequest";
import type { Property } from "./types/types";
import Loader from "./components/Loader/Loader";
import PropertyCard from "./components/PropertyCard/PropertyCard";
import Tile from "./components/Tile/Tile";
import styles from "./page.module.css";
import Image from "next/image";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[] | null>(null);
  const [visibleCards, setVisibleCards] = useState(6)  // nombre de cartes visibles par lot

  const loadMoreProperties = () => {
    setVisibleCards(prev => prev+6)
  }

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const properties = await getRequest<Property[]>("api/properties");
        setProperties(properties);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    loadProperties();
  }, []);

  return (
    <main className={styles.homeWrapper}>
      {loading && (
        <div role="status" aria-live="polite">
          <Loader />
          <span className="sr-only">Chargement des logements…</span>
        </div>
      )}
      <section className={styles.hero}>
        <h1>Chez vous, partout et ailleurs</h1>
        <p>
          Avec Kasa, vivez des séjours uniques dans des hébergements chaleureux,
          sélectionnés avec soin par nos hôtes.
        </p>
        <div className={styles.heroPictureContainer}>
          <img src="/pictures/hero.png" alt="" />
        </div>
      </section>
      <section className={styles.cardWrapper} aria-label="nos logements">
        {properties?.slice(0, visibleCards).map((property) => (
          <PropertyCard property={property} key={property.slug} />
        ))}
        {properties && visibleCards < properties.length && (
          <button 
            onClick={loadMoreProperties}
            className={styles.loadMore}
          >Voir plus de logements...</button>
        )}
      </section>
      <section className={styles.explanations}>
        <h2>Comment ça marche ?</h2>
        <p>Que vous partiez pour un week-end improvisé, des vacances en famille ou un voyage professionnel, <br/>Kasa vous aide à trouver un lieu qui vous ressemble.</p>
        <div className={styles.tiles}>
          <Tile title={"Recherchez"} description={"Entrez votre destination, vos dates et laissez Kasa faire le reste"}/>
          <Tile title={"Réservez"} description={"Profitez d’une plateforme sécurisée et de profils d’hôtes vérifiés."}/>
          <Tile title={"Vivez l'expérience"} description={"Installez-vous, profitez de votre séjour, et sentez-vous chez vous, partout."}/>
        </div>
      </section>
    </main>
  );
}
