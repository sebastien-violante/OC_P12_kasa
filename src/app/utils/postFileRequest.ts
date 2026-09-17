import type { ApiResponse } from "../types/types";

type PostFileRequestProps = {
  url: string;
  token?: string;
  file: File;
  purpose?: string;
  property_id?: string;
};

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
