const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL n'est pas définie.");
}

export function apiUrl(endpoint: string): string {
  return `${API_URL}${endpoint}`;
}