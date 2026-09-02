import styles from "./PropertyCard.module.css";
import type { Property } from "@/app/types/types";
import Image from "next/image";
import Link from "next/link";

type PropertyCardProps = {
  property: Property;
};
export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <article className={styles.card}>
      <Link href="#">
        <div className={styles.pictureContainer}>
          <Image src={property.cover} alt={`photo du logement ${property.title}`} fill />
        </div>
        <div className={styles.cardData}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>{property.title}</h2>
            <p className={styles.cardDescription}>{property.location}</p>
          </div>
          <p>
            <span className={styles.price}>{property.price_per_night}€</span>
            <span className={styles.label}> par nuit</span></p>
        </div>
        <div className={styles.favorite}>
          <img alt="" src="/pictures/heart.svg"/>
        </div>
      </Link>
      
    </article>
  );
}
