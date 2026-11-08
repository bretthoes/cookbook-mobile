const VIDEO_RECIPE_HOSTS = ["tiktok.com", "instagram.com", "pinterest.com", "pin.it"]

const YOUTUBE_HOSTS = ["youtube.com", "youtube-nocookie.com", "youtu.be"]

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

/** A YouTube link that is not a Short. Reject these before calling Spoonacular. */
export function recipeUrlIsLongFormYouTube(url: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }

  const host = parsed.hostname.toLowerCase().replace(/\.$/, "")
  if (!isYouTubeHost(host)) return false
  return !isYouTubeShort(host, parsed.pathname)
}

/** Full YouTube videos are rejected. Only /shorts/ links are videos we import. */
function isYouTubeShort(host: string, pathname: string): boolean {
  if (!isYouTubeHost(host)) return false
  const path = pathname.toLowerCase().replace(/\/+$/, "")
  return path === "/shorts" || path.startsWith("/shorts/")
}

function isYouTubeHost(host: string): boolean {
  return YOUTUBE_HOSTS.some((suffix) => host === suffix || host.endsWith(`.${suffix}`))
}
