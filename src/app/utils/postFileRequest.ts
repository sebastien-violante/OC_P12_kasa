import type { ApiResponse } from "../types/types";

type PostFileRequestProps = {
  url: string;
  token?: string;
  file: File;
  purpose?: string;
  property_id?: string;
};

/**
 * Envoie un fichier à l'API via une requête multipart/form-data.
 *
 * Ajoute le token d'authentification lorsqu'il est fourni ainsi que les
 * informations complémentaires permettant d'identifier l'usage du fichier.
 *
 * @template TResponse - Type attendu pour les données retournées par l'API.
 * @param url - URL de la ressource à laquelle envoyer le fichier.
 * @param token - Token d'authentification optionnel.
 * @param file - Fichier à envoyer.
 * @param purpose - Usage associé au fichier.
 * @param property_id - Identifiant optionnel du logement associé au fichier.
 * @returns La réponse de l'API contenant les données du fichier envoyé.
 * @throws Une erreur lorsque la réponse du serveur est invalide ou que
 * la requête échoue.
 */
export default async function postFileRequest<TResponse = unknown>({
  url,
  token,
  file,
  purpose,
  property_id,
}: PostFileRequestProps): Promise<ApiResponse<TResponse>> {
  const formData = new FormData();

  formData.append("file", file);

  if (purpose) {
    formData.append("purpose", purpose);
  }

  if (property_id) {
    formData.append("property_id", property_id);
  }

  const headers: HeadersInit = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
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
    message: "Fichier envoyé avec succès",
    data: result,
  };
}