import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Property } from "@/app/types/types";
import PropertyContent from "./PropertyContent";
import JsonLd from "@/app/components/JsonLd/JsonLd";
import { apiUrl } from "@/app/utils/api";

type PropertyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Récupère les données d'un logement à partir de son identifiant.
 *
 * Retourne `null` lorsque le logement n'existe pas afin de permettre
 * à la page de gérer le cas 404 avec `notFound()`.
 */
async function getProperty(id: string): Promise<Property | null> {
  const response = await fetch(apiUrl(`/api/properties/${id}`), {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Impossible de récupérer le logement.");
  }

  return response.json();
}

/**
 * Génère les métadonnées SEO de la page à partir des informations
 * du logement demandé.
 *
 * Une version spécifique est également générée lorsque le logement
 * n'existe pas afin d'éviter d'afficher des métadonnées incohérentes.
 */
export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    return {
      title: "Logement introuvable | Kasa",
      description: "Le logement demandé n'existe pas.",
    };
  }

  return {
    title: `${property.title} | Kasa`,
    description: property.description,
    alternates: {
      canonical: `/logement/${property.id}`,
    },
    openGraph: {
      title: `${property.title} | Kasa`,
      description: property.description,
      url: `/logement/${property.id}`,
      siteName: "Kasa",
      images: [
        {
          url: property.cover,
          alt: property.title,
        },
      ],
      locale: "fr_FR",
      type: "website",
    },
  };
}

/**
 * Affiche la page détail d'un logement.
 *
 * Prépare également les données structurées Schema.org afin de permettre
 * aux moteurs de recherche d'identifier le logement et ses informations
 * principales.
 */
export default async function PropertyPage({
  params,
}: PropertyPageProps) {
  const { id } = await params;

  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  const propertySchema = {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: property.title,
    description: property.description,
    image: [property.cover, ...(property.pictures ?? [])],
    address: {
      "@type": "PostalAddress",
      addressLocality: property.location,
    },
    offers: {
      "@type": "Offer",
      price: property.price_per_night,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
  };

  // Ajout de la note moyenne uniquement lorsqu'au moins une évaluation existe.
  if (
    property.rating_avg !== undefined &&
    property.ratings_counts !== undefined &&
    property.ratings_counts > 0
  ) {
    Object.assign(propertySchema, {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: property.rating_avg,
        ratingCount: property.ratings_counts,
      },
    });
  }

  return (
    <>
      <JsonLd data={propertySchema} />

      <PropertyContent property={property} />
    </>
  );
}