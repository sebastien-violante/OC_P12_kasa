import postFileRequest from "./postFileRequest";
import { apiUrl } from "./api";

type PictureInput = {
  file: File;
  purpose: string;
};

type PictureResult = {
  url: string;
  purpose: string;
};

type UploadResponse = {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
  purpose: string;
  property_id?: string;
  instructions?: string;
};

/**
 * Envoie plusieurs images à l'API et récupère leurs URL.
 *
 * Les fichiers sont envoyés séquentiellement afin de conserver l'ordre
 * fourni et chaque erreur d'upload est traitée indépendamment.
 *
 * @param pictures - Liste des fichiers à envoyer avec leur usage.
 * @param token - Token d'authentification optionnel.
 * @returns Les URL et usages des images correctement envoyées.
 */
export default async function getPictureUrls(
  pictures: PictureInput[],
  token?: string,
): Promise<PictureResult[]> {
  const results: PictureResult[] = [];

  for (const picture of pictures) {
    try {
      const result = await postFileRequest<UploadResponse>({
        url: apiUrl("/api/uploads/image"),
        token,
        file: picture.file,
        purpose: picture.purpose,
      });

      if (result.data) {
        results.push({
          url: result.data.url,
          purpose: result.data.purpose,
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'upload :", error);
    }
  }

  return results;
}