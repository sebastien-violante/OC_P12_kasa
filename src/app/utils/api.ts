const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL n'est pas définie.");
}

/**
 * Construit l'URL complète d'un endpoint de l'API.
 * @param endpoint - Chemin de l'endpoint à ajouter à l'URL de base.
 * @returns L'URL complète de l'endpoint.
 */
export function apiUrl(endpoint: string): string {
  return `${API_URL}${endpoint}`;
}