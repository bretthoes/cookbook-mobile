/** Cookbook covers are portrait: 3 wide by 4 tall, matching the 90×120 card. */
export const COOKBOOK_COVER_ASPECT = 3 / 4

/** Recipe photos and step photos are square. */
export const RECIPE_IMAGE_ASPECT = 1

export type PixelCrop = {
  originX: number
  originY: number
  width: number
  height: number
}

function clamp(value: number, min: number, max: number): number {
  const next = Math.min(max, Math.max(min, value))
  return next === 0 ? 0 : next
}

/** Screen pixels per image pixel so the image covers the crop frame. */
export function coverScale(
  imageWidth: number,
  imageHeight: number,
  frameWidth: number,
  frameHeight: number,
): number {
  if (imageWidth <= 0 || imageHeight <= 0 || frameWidth <= 0 || frameHeight <= 0) return 1
  return Math.max(frameWidth / imageWidth, frameHeight / imageHeight)
}

/** Screen pixels per image pixel so the whole image fits in the area. */
export function containScale(
  imageWidth: number,
  imageHeight: number,
  areaWidth: number,
  areaHeight: number,
): number {
  if (imageWidth <= 0 || imageHeight <= 0 || areaWidth <= 0 || areaHeight <= 0) return 1
  return Math.min(areaWidth / imageWidth, areaHeight / imageHeight)
}

/** Largest crop frame of `aspect` (width / height) that sits inside the displayed image. */
export function frameInsideImage(
  displayedWidth: number,
  displayedHeight: number,
  aspect: number,
): { width: number; height: number } {
  if (displayedWidth <= 0 || displayedHeight <= 0 || aspect <= 0) {
    return { width: 0, height: 0 }
  }
  let width = displayedWidth
  let height = width / aspect
  if (height > displayedHeight) {
    height = displayedHeight
    width = height * aspect
  }
  return { width, height }
}

/**
 * Keep a pan inside the crop frame. Translation is relative to the image
 * being centered on the frame.
 */
export function clampImageTranslation(input: {
  imageWidth: number
  imageHeight: number
  frameWidth: number
  frameHeight: number
  scale: number
  translateX: number
  translateY: number
}): { translateX: number; translateY: number } {
  const displayedWidth = input.imageWidth * input.scale
  const displayedHeight = input.imageHeight * input.scale
  const maxX = Math.max(0, (displayedWidth - input.frameWidth) / 2)
  const maxY = Math.max(0, (displayedHeight - input.frameHeight) / 2)
  return {
    translateX: clamp(input.translateX, -maxX, maxX),
    translateY: clamp(input.translateY, -maxY, maxY),
  }
}

/** Crop rectangle in source pixels for the frame currently covering the image. */
export function imageCropRect(input: {
  imageWidth: number
  imageHeight: number
  frameWidth: number
  frameHeight: number
  scale: number
  translateX: number
  translateY: number
}): PixelCrop {
  const scale = input.scale > 0 ? input.scale : 1
  const { translateX, translateY } = clampImageTranslation({ ...input, scale })
  const displayedWidth = input.imageWidth * scale
  const displayedHeight = input.imageHeight * scale
  const imageLeft = (input.frameWidth - displayedWidth) / 2 + translateX
  const imageTop = (input.frameHeight - displayedHeight) / 2 + translateY

  const originX = clamp(-imageLeft / scale, 0, Math.max(0, input.imageWidth - 1))
  const originY = clamp(-imageTop / scale, 0, Math.max(0, input.imageHeight - 1))
  const width = clamp(input.frameWidth / scale, 1, input.imageWidth - originX)
  const height = clamp(input.frameHeight / scale, 1, input.imageHeight - originY)
  const roundedX = Math.round(originX)
  const roundedY = Math.round(originY)

  return {
    originX: roundedX,
    originY: roundedY,
    width: Math.max(1, Math.min(Math.round(width), input.imageWidth - roundedX)),
    height: Math.max(1, Math.min(Math.round(height), input.imageHeight - roundedY)),
  }
}
