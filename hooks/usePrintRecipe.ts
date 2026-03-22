import type { Recipe } from "@/models/Recipe/Recipe"
import { translate } from "@/i18n"
import * as Print from "expo-print"
import { useCallback } from "react"

function buildRecipeHtml(recipe: Recipe): string {
  const metaItems: string[] = []
  if (recipe.preparationTimeInMinutes) {
    metaItems.push(`${translate("recipeDetailsScreen:prep")}: ${recipe.preparationTimeInMinutes} min`)
  }
  if (recipe.cookingTimeInMinutes) {
    metaItems.push(`${translate("recipeDetailsScreen:cook")}: ${recipe.cookingTimeInMinutes} min`)
  }
  if (recipe.bakingTimeInMinutes) {
    metaItems.push(`${translate("recipeDetailsScreen:bake")}: ${recipe.bakingTimeInMinutes} min`)
  }
  if (recipe.servings) {
    metaItems.push(`${translate("recipeDetailsScreen:servings")}: ${recipe.servings}`)
  }

  const metaHtml = metaItems
    .map((item) => `<span class="meta">${item}</span>`)
    .join("")

  const ingredients = recipe.ingredients
    .slice()
    .sort((a, b) => a.ordinal - b.ordinal)
    .map((i) => `<li>${i.name}${i.optional ? " <em>(optional)</em>" : ""}</li>`)
    .join("")

  const directions = recipe.directions
    .slice()
    .sort((a, b) => a.ordinal - b.ordinal)
    .map((d) => `<li>${d.text}</li>`)
    .join("")

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {
      font-family: Georgia, serif;
      max-width: 680px;
      margin: 40px auto;
      padding: 0 24px;
      color: #2D2925;
      line-height: 1.6;
    }
    h1 { font-size: 28px; margin-bottom: 6px; }
    .summary { color: #6B5E50; font-style: italic; margin-bottom: 16px; }
    .meta-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
    .meta {
      background: #EFE6D9;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 13px;
    }
    h2 {
      font-size: 18px;
      border-bottom: 2px solid #EFE6D9;
      padding-bottom: 4px;
      margin-top: 28px;
    }
    ul, ol { padding-left: 20px; }
    li { margin-bottom: 6px; }
  </style>
</head>
<body>
  <h1>${recipe.title}</h1>
  ${recipe.summary ? `<p class="summary">${recipe.summary}</p>` : ""}
  ${metaHtml ? `<div class="meta-row">${metaHtml}</div>` : ""}
  ${ingredients ? `<h2>${translate("recipeDetailsScreen:ingredients")}</h2><ul>${ingredients}</ul>` : ""}
  ${directions ? `<h2>${translate("recipeDetailsScreen:directions")}</h2><ol>${directions}</ol>` : ""}
</body>
</html>`
}

export function usePrintRecipe() {
  return useCallback(async (recipe: Recipe) => {
    const html = buildRecipeHtml(recipe)
    await Print.printAsync({ html })
  }, [])
}
