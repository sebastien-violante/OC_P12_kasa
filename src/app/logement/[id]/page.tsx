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
  };
}

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
    image: [
      property.cover,
      ...(property.pictures ?? []),
    ],
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
