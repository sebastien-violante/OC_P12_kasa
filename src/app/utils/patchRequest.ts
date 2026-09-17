import type { ApiResponse } from "../types/types";

type PatchRequestProps<TPayload> = {
  url: string;
  token?: string;
  payload?: TPayload;
};

/**
 * Effectue une requête PATCH à l'API.
 *
 * @param url - Endpoint de l'API
 * @param token - Token d'authentification
 * @param payload - Données envoyées dans le body
 */
export default async function patchRequest<TPayload, TResponse = unknown>({
  url,
  token,
  payload,
}: PatchRequestProps<TPayload>): Promise<ApiResponse<TResponse>> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });

  let result: TResponse;

  try {
    result = await response.json();
  } catch {
    throw {
      status: response.status,
      message: "Réponse invalide du serveur.",
    };
  }

  if (!response.ok) {
    throw {
      status: response.status,
      message: "Une erreur serveur est survenue.",
    };
  }

  return {
    success: true,
    message: "Requête effectuée avec succès",
    data: result,
  };
}