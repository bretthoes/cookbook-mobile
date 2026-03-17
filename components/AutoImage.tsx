import { useCallback, useState } from "react"
import { Image, ImageLoadEventData, ImageProps } from "expo-image"

export interface AutoImageProps extends Omit<ImageProps, "onLoad"> {
  /**
   * How wide should the image be?
   */
  maxWidth?: number
  /**
   * How tall should the image be?
   */
  maxHeight?: number
  /**
   * Fallback aspect ratio when image dimensions cannot be determined.
   * @default 1 (square)
   */
  fallbackAspectRatio?: number
}

function scaleDimensions(
  w: number,
  h: number,
  maxWidth?: number,
  maxHeight?: number,
): { width: number; height: number } {
  const aspectRatio = w / h
  if (Number.isNaN(aspectRatio)) return { width: 0, height: 0 }

  if (maxWidth && maxHeight) {
    const scale = Math.min(maxWidth / w, maxHeight / h)
    return { width: w * scale, height: h * scale }
  } else if (maxWidth) {
    return { width: maxWidth, height: maxWidth / aspectRatio }
  } else if (maxHeight) {
    return { width: maxHeight * aspectRatio, height: maxHeight }
  }
  return { width: w, height: h }
}

function getFallbackDimensions(
  maxWidth?: number,
  maxHeight?: number,
  fallbackAspectRatio = 1,
): { width: number; height: number } {
  if (maxWidth && maxHeight) {
    if (fallbackAspectRatio >= 1) {
      return { width: maxWidth, height: maxWidth / fallbackAspectRatio }
    }
    return { width: maxHeight * fallbackAspectRatio, height: maxHeight }
  } else if (maxWidth) {
    return { width: maxWidth, height: maxWidth / fallbackAspectRatio }
  } else if (maxHeight) {
    return { width: maxHeight * fallbackAspectRatio, height: maxHeight }
  }
  return { width: 0, height: 0 }
}

/**
 * An Image component that automatically sizes a remote or data-uri image.
 *
 * Uses expo-image for built-in disk+memory caching. Dimensions are determined
 * from the onLoad callback (no separate network request like Image.getSize).
 */
export function AutoImage(props: AutoImageProps) {
  const { maxWidth, maxHeight, fallbackAspectRatio = 1, style, ...rest } = props
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

  const onLoad = useCallback(
    (event: ImageLoadEventData) => {
      const { width: w, height: h } = event.source
      setDimensions(scaleDimensions(w, h, maxWidth, maxHeight))
    },
    [maxWidth, maxHeight],
  )

  const displayDimensions =
    dimensions ?? getFallbackDimensions(maxWidth, maxHeight, fallbackAspectRatio)

  return (
    <Image {...rest} style={[displayDimensions, style]} onLoad={onLoad} contentFit="contain" />
  )
}
