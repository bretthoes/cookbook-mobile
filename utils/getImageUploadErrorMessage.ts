import { translate, type TxKeyPath } from "@/i18n"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { MAX_IMAGE_SIZE_MB } from "@/utils/imageUploadLimits"

export function getImageUploadErrorMessage(
  problem: GeneralApiProblem,
  fallbackTx: TxKeyPath,
): string {
  if (problem.kind === "file-too-large") {
    return translate("errors:imageTooLarge", { maxSizeMb: MAX_IMAGE_SIZE_MB })
  }
  return translate(fallbackTx)
}
