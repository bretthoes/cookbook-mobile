import { useLayoutEffect, useState } from "react"
import { Image, ImageProps, ImageURISource, Platform } from "react-native"

export interface AutoImageProps extends ImageProps {
  /**
   * How wide should the image be?
   */
  maxWidth?: number
  /**
   * How tall should the image be?
   */
  maxHeight?: number
  /**
   * Fallback aspect ratio when image dimensions cannot be determined (e.g., due to CORS).
   * @default 1 (square)
   */
  fallbackAspectRatio?: number
}

/**
 * A hook that will return the scaled dimensions of an image based on the
 * provided dimensions' aspect ratio. If no desired dimensions are provided,
 * it will return the original dimensions of the remote image.
 *
 * How is this different from `resizeMode: 'contain'`? Firstly, you can
 * specify only one side's size (not both). Secondly, the image will scale to fit
 * the desired dimensions instead of just being contained within its image-container.
 * @param {number} remoteUri - The URI of the remote image.
 * @param {number} dimensions - The desired dimensions of the image. If not provided, the original dimensions will be returned.
 * @param {number} fallbackAspectRatio - Fallback aspect ratio when dimensions cannot be determined. Defaults to 1 (square).
 * @returns {[number, number]} - The scaled dimensions of the image.
 */
export function useAutoImage(
  remoteUri: string,
  dimensions?: [maxWidth?: number, maxHeight?: number],
  fallbackAspectRatio: number = 1,
): [width: number, height: number] {
  const [[remoteWidth, remoteHeight], setRemoteImageDimensions] = useState([0, 0])
  const [failedToLoad, setFailedToLoad] = useState(false)
  const remoteAspectRatio = remoteWidth / remoteHeight
  const [maxWidth, maxHeight] = dimensions ?? []

  useLayoutEffect(() => {
    if (!remoteUri) return

    // Reset state when URI changes
    setFailedToLoad(false)
    setRemoteImageDimensions([0, 0])

    Image.getSize(
      remoteUri,
      (w, h) => setRemoteImageDimensions([w, h]),
      () => {
        // getSize can fail due to CORS issues with remote images (e.g., S3)
        // The image will still display using fallback dimensions
        setFailedToLoad(true)
      },
    )
  }, [remoteUri])

  // Use fallback dimensions when getSize fails
  if (failedToLoad) {
    if (maxWidth && maxHeight) {
      // Use smaller dimension based on fallback aspect ratio
      if (fallbackAspectRatio >= 1) {
        return [maxWidth, maxWidth / fallbackAspectRatio]
      } else {
        return [maxHeight * fallbackAspectRatio, maxHeight]
      }
    } else if (maxWidth) {
      return [maxWidth, maxWidth / fallbackAspectRatio]
    } else if (maxHeight) {
      return [maxHeight * fallbackAspectRatio, maxHeight]
    }
    // No dimensions provided, can't determine fallback size
    return [0, 0]
  }

  if (Number.isNaN(remoteAspectRatio)) return [0, 0]

  if (maxWidth && maxHeight) {
    const aspectRatio = Math.min(maxWidth / remoteWidth, maxHeight / remoteHeight)
    return [remoteWidth * aspectRatio, remoteHeight * aspectRatio]
  } else if (maxWidth) {
    return [maxWidth, maxWidth / remoteAspectRatio]
  } else if (maxHeight) {
    return [maxHeight * remoteAspectRatio, maxHeight]
  } else {
    return [remoteWidth, remoteHeight]
  }
}

/**
 * An Image component that automatically sizes a remote or data-uri image.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/AutoImage/}
 * @param {AutoImageProps} props - The props for the `AutoImage` component.
 * @returns {JSX.Element} The rendered `AutoImage` component.
 */
export function AutoImage(props: AutoImageProps) {
  const { maxWidth, maxHeight, fallbackAspectRatio, ...ImageProps } = props
  const source = props.source as ImageURISource

  const [width, height] = useAutoImage(
    Platform.select({
      web: (source?.uri as string) ?? (source as string),
      default: source?.uri as string,
    }),
    [maxWidth, maxHeight],
    fallbackAspectRatio,
  )

  return <Image {...ImageProps} style={[{ width, height }, props.style]} />
}
