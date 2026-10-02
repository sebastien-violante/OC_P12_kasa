type JsonLdProps = {
  data: Record<string, unknown>;
};

/**
 * Injecte des données structurées JSON-LD dans la page.
 *
 * @param data - Données structurées à convertir en JSON-LD.
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}