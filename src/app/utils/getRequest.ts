import type { ApiErrorDetail } from "../types/types";

type GetRequestProps = {
  url: string;
  token?: string | null;
};

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
    cache: "no-store",
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
