import { api } from "@/services/api"
import { getAccessToken } from "@/services/api/client"
import * as SecureStore from "expo-secure-store"

function normalizeAppUserId(value: string): string {
  return value.trim().toLowerCase()
}

/**
 * Stable RevenueCat app user id (login email, lowercased).
 * Matches webhook lookup by email on the backend.
 */
export async function resolveRevenueCatAppUserId(options?: {
  storedUserId?: string | null
  authEmail?: string | null
}): Promise<string | null> {
  if (options?.storedUserId?.trim()) {
    return normalizeAppUserId(options.storedUserId)
  }

  if (options?.authEmail?.trim()) {
    return normalizeAppUserId(options.authEmail)
  }

  const storedEmail = await SecureStore.getItemAsync("email")
  if (storedEmail?.trim()) {
    return normalizeAppUserId(storedEmail)
  }

  if (!getAccessToken()) return null

  const response = await api.getEmail()
  if (response.kind === "ok" && response.email?.trim()) {
    const email = normalizeAppUserId(response.email)
    await SecureStore.setItemAsync("email", email)
    return email
  }

  return null
}
