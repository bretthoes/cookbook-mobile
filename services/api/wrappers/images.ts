import { apiClientInstance } from "@/services/api/client"
import {
  ApiResult,
  toOkResult,
  toProblemFromError,
  toProblemFromResponse,
} from "@/services/api/toApiResult"
import { ImagePickerAsset } from "expo-image-picker"

const { client } = apiClientInstance

/** ImageSharp on the API has no decoder for these. The picker base64 is JPEG. */
const SERVER_UNSUPPORTED_EXTENSIONS = new Set(["heic", "heif", "avif"])

function extensionOf(image: ImagePickerAsset): string {
  const fromUri = image.uri.split("/").pop()?.split("?")[0]
  const raw = image.fileName ?? fromUri ?? "image.jpg"
  return raw.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() ?? "jpg"
}

/**
 * Expo's fetch rejects React Native `{ uri, name, type }` parts, and it also
 * rejects creating a Blob from raw bytes. A Blob from a data URL is accepted.
 * The picker base64 is JPEG, including for HEIC photos.
 */
async function toUploadPart(image: ImagePickerAsset): Promise<{ blob: Blob; filename: string }> {
  if (image.base64) {
    const decoded = await fetch(`data:image/jpeg;base64,${image.base64}`)
    if (!decoded.ok) throw new Error("Could not read the selected image")
    const raw = await decoded.blob()
    return {
      blob: new Blob([raw], { type: "image/jpeg" }),
      filename: "image.jpg",
    }
  }

  const file = await fetch(image.uri)
  if (!file.ok) throw new Error("Could not read the selected image")
  const raw = await file.blob()
  const ext = extensionOf(image)
  if (SERVER_UNSUPPORTED_EXTENSIONS.has(ext)) {
    throw new Error("Could not prepare this photo for upload")
  }
  const type = image.mimeType || raw.type || "image/jpeg"
  return {
    blob: raw.type ? raw : new Blob([raw], { type }),
    filename: `image.${ext}`,
  }
}

export async function uploadImage(
  images: ImagePickerAsset[],
): Promise<ApiResult<{ keys: string[] }>> {
  try {
    const formData = new FormData()
    for (const image of images) {
      const part = await toUploadPart(image)
      formData.append("files", part.blob, part.filename)
    }

    const { data, error, response } = await client.POST("/api/Images", {
      body: formData as never,
      bodySerializer: (body) => body as FormData,
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "not-found" }
    return toOkResult({ keys: Array.isArray(data) ? data : [String(data)] })
  } catch (e) {
    return toProblemFromError(e)
  }
}
