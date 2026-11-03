const VIDEO_RECIPE_HOSTS = ["tiktok.com", "instagram.com", "pinterest.com", "pin.it"]

/** TikTok, Instagram, and Pinterest links need Spoonacular's video extraction. */
export function recipeUrlUsesVideoExtraction(url: string): boolean {
  let host: string
  try {
    host = new URL(url).hostname.toLowerCase()
  } catch {
    return false
  }

  return VIDEO_RECIPE_HOSTS.some((suffix) => host === suffix || host.endsWith(`.${suffix}`))
}
