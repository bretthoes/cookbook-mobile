const VIDEO_RECIPE_HOSTS = ["tiktok.com", "instagram.com", "pinterest.com", "pin.it"]

const YOUTUBE_HOSTS = ["youtube.com", "youtube-nocookie.com"]

/** TikTok, Instagram, Pinterest, and YouTube Shorts need Spoonacular's video extraction. */
export function recipeUrlUsesVideoExtraction(url: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }

  const host = parsed.hostname.toLowerCase().replace(/\.$/, "")
  if (isYouTubeShort(host, parsed.pathname)) return true

  return VIDEO_RECIPE_HOSTS.some((suffix) => host === suffix || host.endsWith(`.${suffix}`))
}

/** Full YouTube videos stay on the page parser. Only /shorts/ links are videos we import. */
function isYouTubeShort(host: string, pathname: string): boolean {
  const isYouTube = YOUTUBE_HOSTS.some((suffix) => host === suffix || host.endsWith(`.${suffix}`))
  if (!isYouTube) return false
  const path = pathname.toLowerCase().replace(/\/+$/, "")
  return path === "/shorts" || path.startsWith("/shorts/")
}
