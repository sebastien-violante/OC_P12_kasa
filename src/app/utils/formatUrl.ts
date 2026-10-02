/**
 * Construit une URL complète à partir d'une URL absolue ou d'un chemin relatif.
 * @param url - URL absolue ou chemin relatif de la ressource.
 * @returns L'URL complète de la ressource.
 */
export default function formatUrl(url: string): string {
  const formatedUrl = url.startsWith("http")
    ? url
    : `http://localhost:8000${url.startsWith("/") ? "" : "/"}${url}`;

  return formatedUrl;
}