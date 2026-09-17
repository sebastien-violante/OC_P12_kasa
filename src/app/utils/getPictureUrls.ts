import postFileRequest from "./postFileRequest";

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

export default async function getPictureUrls(
  pictures: PictureInput[],
  token?: string
): Promise<PictureResult[]> {
  const results: PictureResult[] = [];

  for (const picture of pictures) {
    try {
      const result = await postFileRequest<UploadResponse>({
        url: "/api/uploads/image",
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
