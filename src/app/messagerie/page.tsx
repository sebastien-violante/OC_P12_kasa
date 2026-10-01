import Messagerie from "./Messagerie";

type PageProps = {
  searchParams: Promise<{
    conversationId?: string;
    returnTo?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Messagerie
      conversationId={params.conversationId}
      returnTo={params.returnTo}
    />
  );
}