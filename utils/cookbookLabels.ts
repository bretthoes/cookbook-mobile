import { translate } from "@/i18n"
import type { CookbookItem } from "@/types/cookbook"

export function getCookbookMembersLabel(cookbook: CookbookItem) {
  const count = cookbook.membersCount ?? 0
  return count === 1
    ? translate("cookbooksScreen:cookbookListScreen.cookbookCard.membersLabel", { count })
    : translate("cookbooksScreen:cookbookListScreen.cookbookCard.membersLabel_plural", { count })
}

export function parseCookbookTitle(title: string | undefined) {
  const trimmed = title?.trim() ?? ""
  const defaultValue = { title: trimmed }
  if (!defaultValue.title) return defaultValue
  const titleMatches = trimmed.match(/^(RNR.*\d)(?: - )(.*$)/)
  if (!titleMatches || titleMatches.length !== 3) return defaultValue
  return { title: titleMatches[1], subtitle: titleMatches[2] }
}

export function getCookbookRecipesLabel(cookbook: CookbookItem) {
  const count = cookbook.recipeCount ?? 0
  return count === 1
    ? translate("cookbooksScreen:cookbookListScreen.cookbookCard.recipesLabel", { count })
    : translate("cookbooksScreen:cookbookListScreen.cookbookCard.recipesLabel_plural", { count })
}
