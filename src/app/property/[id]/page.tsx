"use client";

import styles from "./page.module.css";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Property } from "@/app/types/types";
import getRequest from "@/app/utils/getRequest";
import Loader from "@/app/components/Loader/Loader";
import Link from "next/link";
import Image from "next/image";
import Tag from "@/app/components/Tag/Tag";

export default function Property() {
  const params = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const propertyId = params.id;
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const property = await getRequest<Property>({url: `/api/properties/${propertyId}`})
        setProperty(property);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    loadProperty();
  }, []);

  return (
    <>
      <section className={styles.top}>
        <Link href="/">
          <div className={styles.backToProperties}>
            <img src="/pictures/back-arrow.svg" alt="" />
            <span>Retour aux annonces</span>
          </div>
        </Link>
        {loading && (
          <div role="status" aria-live="polite">
            <Loader />
            <span className="sr-only">Chargement des logements…</span>
          </div>
        )}
      </section>

      <div className={styles.mainWrapper}>
        <section className={styles.property}>
          <div className={styles.grid}>
            <div className={styles.item}>
              {property?.cover && (
                <Image
                  src={property?.cover}
                  fill
                  alt={`image de couverture de la propriété ${property?.title}`}
                  className={styles.cover}
                  priority
                />
              )}
            </div>
            {property?.pictures?.slice(1).map((picture, index) => (
              <div key={index} className={styles.item}>
                <Image
                  src={picture}
                  fill
                  alt=""
                  className={styles.image}
                  priority
                />
              </div>
            ))}
          </div>
          <article className={styles.data}>
            <h1>{property?.title}</h1>
            <p className={styles.location}>
              <img src="/pictures/localisation.svg" alt="" />
              {property?.location}
            </p>
            <p className={styles.description}>{property?.description}</p>
            <div className={styles.equipments}>
              <h2>Equipements</h2>
              <div className={styles.tags}>
                {property?.equipments?.map((equipment) => (
                  <Tag key={equipment} item={equipment} select={false} />
                ))}
              </div>
            </div>
            <div className={styles.category}>
              <h2>Catégorie</h2>
              <div className={styles.tags}>
                {property?.tags?.map((tag) => (
                  <Tag key={tag} item={tag} select={true} />
                ))}
              </div>
            </div>
          </article>
        </section>
        <section className={styles.host}>
          <h2>Votre hôte</h2>
          <div className={styles.data}>
            <div>
              {property?.host.picture && (
                <Image
                  src={property?.host.picture ?? ""}
                  alt={property?.host.name ?? ""}
                  height="82"
                  width="82"
                />
              )}
            </div>
            <p>{property?.host.name}</p>
            <div className={styles.rating}>
              <img src="/pictures/star-full.svg" alt="" />
              {property?.rating_avg ?? 0}
            </div>
          </div>
          <Link href="#" className={styles.link}>
            Contacter l&apos;hôte
          </Link>
          <Link href="#" className={styles.link}>
            Envoyer un message
          </Link>
        </section>
      </div>
    </>
  );
}
