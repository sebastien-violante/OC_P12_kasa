import type { ApiErrorDetail } from "../types/types";

type GetRequestProps = {
  url: string;
  token?: string | null;
};

/**
 * Effectue une requête GET vers l'API et retourne la réponse typée.
 *
 * Ajoute automatiquement le token d'authentification lorsqu'il est fourni
 * et transforme les réponses d'erreur de l'API en objets exploitables
 * par les appelants.
 *
 * @template TResponse - Type attendu pour les données retournées par l'API.
 * @param url - URL de la ressource à récupérer.
 * @param token - Token d'authentification optionnel.
 * @returns Les données de la réponse avec le type `TResponse`.
 * @throws Une erreur contenant le statut HTTP et les informations retournées
 * par l'API lorsque la requête échoue ou que la réponse n'est pas valide.
 */
export default async function getRequest<TResponse = unknown>({
  url,
  token,
}: GetRequestProps): Promise<TResponse> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
    next: {
      revalidate: 60,
    },
  });

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw {
      status: response.status,
      message: "Réponse invalide du serveur.",
    };
  }

  if (!response.ok) {
    const error = result as {
      error?: string;
      message?: string;
      details?: ApiErrorDetail[];
    };

    throw {
      status: response.status,
      message:
        error.message || error.error || "Une erreur serveur est survenue.",
      error: error.error,
      details: error.details,
    };
  }

  return result as TResponse;
}