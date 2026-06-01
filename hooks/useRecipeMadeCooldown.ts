import {
  getRecipeMadeCooldownEndsAt,
  isRecipeMadeCooldownActive,
  setRecipeMadeCooldown,
} from "@/utils/recipeMadeCooldown"
import { useCallback, useEffect, useState } from "react"

export function useRecipeMadeCooldown(recipeId: number) {
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number | null>(null)

  const refresh = useCallback(async () => {
    if (recipeId <= 0) {
      setCooldownEndsAt(null)
      return
    }
    setCooldownEndsAt(await getRecipeMadeCooldownEndsAt(recipeId))
  }, [recipeId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const recordCooldown = useCallback(async () => {
    if (recipeId <= 0) return
    const endsAt = await setRecipeMadeCooldown(recipeId)
    setCooldownEndsAt(endsAt)
  }, [recipeId])

  return {
    canRecordMade: !isRecipeMadeCooldownActive(cooldownEndsAt),
    recordCooldown,
    refresh,
  }
}
