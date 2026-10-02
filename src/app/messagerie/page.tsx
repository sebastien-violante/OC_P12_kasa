import Messagerie from "./Messagerie";

type PageProps = {
  searchParams: Promise<{
    conversationId?: string;
    returnTo?: string;
  }>;
};

/**
 * Affiche la messagerie en transmettant les paramètres de navigation
 * récupérés depuis l'URL.
 */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Messagerie
      conversationId={params.conversationId}
      returnTo={params.returnTo}
    />
  );
}