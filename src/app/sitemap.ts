import type { MetadataRoute } from "next";
import type { Property } from "./types/types";
import { apiUrl } from "./utils/api";

const BASE_URL = "https://oc-p12-kasa.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const response = await fetch(apiUrl("/api/properties"), {
    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    throw new Error("Impossible de récupérer les logements.");
  }

  const properties = (await response.json()) as Property[];

  const propertyUrls: MetadataRoute.Sitemap = properties
    .filter((property) => property.id)
    .map((property) => ({
      url: `${BASE_URL}/logement/${property.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...propertyUrls,
  ];
}