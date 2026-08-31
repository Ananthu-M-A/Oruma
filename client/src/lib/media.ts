import { API_BASE_URL } from "./auth";

export type UploadedMedia = {
  url: string;
  publicId?: string;
  resourceType: "image" | "video" | "raw";
  mimeType: string;
  size: number;
};

export async function uploadMedia(accessToken: string, file: File) {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${API_BASE_URL}/media/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });
  const data = (await response.json().catch(() => ({}))) as UploadedMedia & {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(" ")
      : data.message ?? "Unable to upload media.";
    throw new Error(message);
  }

  return data;
}

export async function deleteMedia(
  accessToken: string,
  media: Pick<UploadedMedia, "publicId" | "resourceType">,
) {
  if (!media.publicId) return;
  const response = await fetch(`${API_BASE_URL}/media`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(media),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(" ")
        : (data.message ?? "Unable to delete media."),
    );
  }
}
