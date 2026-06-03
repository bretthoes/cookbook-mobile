import AsyncStorage from "@react-native-async-storage/async-storage"

const STORAGE_KEY = "recipeMadeCooldowns"

/** Lightweight client-only guard; not enforced on the server. */
export const RECIPE_MADE_COOLDOWN_MS = 12 * 60 * 60 * 1000

type CooldownMap = Record<string, number>

async function readCooldownMap(): Promise<CooldownMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as CooldownMap
  } catch {
    return {}
  }
}

async function writeCooldownMap(map: CooldownMap) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

/** Milliseconds since epoch when the cooldown ends, or null if not in cooldown. */
export async function getRecipeMadeCooldownEndsAt(recipeId: string): Promise<number | null> {
  const map = await readCooldownMap()
  const endsAt = map[String(recipeId)]
  if (endsAt == null) return null
  if (Date.now() >= endsAt) return null
  return endsAt
}

export function isRecipeMadeCooldownActive(cooldownEndsAt: number | null): boolean {
  return cooldownEndsAt != null && Date.now() < cooldownEndsAt
}

export async function setRecipeMadeCooldown(recipeId: string): Promise<number> {
  const endsAt = Date.now() + RECIPE_MADE_COOLDOWN_MS
  const map = await readCooldownMap()
  map[String(recipeId)] = endsAt
  await writeCooldownMap(map)
  return endsAt
}
