import type { Property } from "./types/types";
import getRequest from "./utils/getRequest";
import { apiUrl } from "./utils/api";
import HomeContent from "./HomeContent";
import Tile from "./components/Tile/Tile";
import styles from "./page.module.css";
import JsonLd from "./components/JsonLd/JsonLd";
import Image from "next/image";

export default async function Home() {
  let properties: Property[] = [];

  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Kasa",
        url: "https://oc-p12-kasa.vercel.app",
        logo: "https://oc-p12-kasa.vercel.app/pictures/logo-kasa-full.svg",
        description:
          "Plateforme fictive de réservation d'appartements et de maisons entre particuliers. Ce site est un des projets de la formation Concepteur d'application React proposé par OpenClassrooms. Il a été développé par Sébastien VIOLANTE",
      },
      {
        "@type": "WebSite",
        name: "Kasa",
        url: "https://oc-p12-kasa.vercel.app",
      },
    ],
  };

  try {
    properties = await getRequest<Property[]>({
      url: apiUrl("/api/properties"),
    });
  } catch (error) {
    console.error("Erreur récupération logements :", error);
  }

  return (
    <div className={styles.homeWrapper}>
      <JsonLd data={homeSchema} />
      <section className={styles.hero}>
        <h1>Chez vous, partout et ailleurs</h1>

        <p>
          Avec Kasa, vivez des séjours uniques dans des hébergements chaleureux,
          sélectionnés avec soin par nos hôtes.
        </p>

        <div className={styles.heroPictureContainer}>
          <Image
            className={styles.heroPicture}
            src="/pictures/hero.png"
            alt=""
            fill
            priority
            sizes="1115px"
          />
        </div>
      </section>

      <HomeContent properties={properties} />

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
  );
}
