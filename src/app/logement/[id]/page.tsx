import { notFound } from "next/navigation";
import type { Property } from "@/app/types/types";
import PropertyContent from "./PropertyContent";

type PropertyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getProperty(id: string): Promise<Property | null> {
  const response = await fetch(
    `http://localhost:8000/api/properties/${id}`,
    {
      cache: "no-store",
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      "Impossible de récupérer le logement."
    );
  }

  return response.json();
}

export default async function PropertyPage({
  params,
}: PropertyPageProps) {
  const { id } = await params;

  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return <PropertyContent property={property} />;
}