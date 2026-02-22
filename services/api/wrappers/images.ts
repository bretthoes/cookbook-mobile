import { GeneralApiProblem } from "@/services/api/apiProblem"
import { apiClientInstance } from "@/services/api/client"
import {
  ApiResult,
  toOkResult,
  toProblemFromError,
  toProblemFromResponse,
} from "@/services/api/toApiResult"
import { ImagePickerAsset } from "expo-image-picker"

const { client } = apiClientInstance

export async function uploadImage(
  images: ImagePickerAsset[],
): Promise<ApiResult<{ keys: string[] }>> {
  try {
    const formData = new FormData()
    images.forEach((image) => {
      formData.append("file", {
        uri: image.uri,
        name: image.fileName ?? "image.jpg",
        type: image.mimeType ?? "image/jpeg",
      } as unknown as Blob)
    })

    const { data, error, response } = await client.POST("/api/Images", {
      body: formData as never,
      bodySerializer: (b) => b as FormData,
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "not-found" }
    return toOkResult({ keys: Array.isArray(data) ? data : [String(data)] })
  } catch (e) {
    return toProblemFromError(e)
  }
}
