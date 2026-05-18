import { API_BASE_URL } from "./auth";

export type UploadedMedia = {
  url: string;
  publicId?: string;
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
