/**
 * True when the caption fits under the spotlight and stays inside the overlay,
 * clear of the system navigation bar.
 */
export function guideCaptionFitsBelow({
  holeBottom,
  captionHeight,
  gap,
  overlayTop,
  overlayHeight,
  windowHeight,
  bottomInset,
  edgeMargin,
}: {
  holeBottom: number
  captionHeight: number
  gap: number
  overlayTop: number
  overlayHeight: number
  windowHeight: number
  bottomInset: number
  edgeMargin: number
}): boolean {
  const height = overlayHeight > 0 ? overlayHeight : Math.max(0, windowHeight - overlayTop)
  const navTop = windowHeight - bottomInset
  const usableBottom = Math.min(height, Math.max(0, navTop - overlayTop)) - edgeMargin
  return holeBottom + gap + captionHeight < usableBottom
}
