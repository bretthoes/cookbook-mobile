import type { ImagePickerAsset } from "expo-image-picker"
import { useCallback, useRef, useState } from "react"
import { Image } from "react-native"

export type PendingImageCrop = {
  asset: ImagePickerAsset
  aspect: number
}

function withKnownSize(asset: ImagePickerAsset): Promise<ImagePickerAsset> {
  if (asset.width > 0 && asset.height > 0) return Promise.resolve(asset)
  return new Promise((resolve) => {
    Image.getSize(
      asset.uri,
      (width, height) => resolve({ ...asset, width, height }),
      () => resolve(asset),
    )
  })
}

/** Walks picked photos through the cropper, one at a time. Cancel drops the batch. */
export function useImageCropSession() {
  const [pending, setPending] = useState<PendingImageCrop | null>(null)
  const queue = useRef<ImagePickerAsset[]>([])
  const accepted = useRef<ImagePickerAsset[]>([])
  const aspect = useRef(1)
  const resolveRef = useRef<((assets: ImagePickerAsset[] | null) => void) | null>(null)

  const finish = useCallback((assets: ImagePickerAsset[] | null) => {
    queue.current = []
    accepted.current = []
    setPending(null)
    const resolve = resolveRef.current
    resolveRef.current = null
    resolve?.(assets)
  }, [])

  const start = useCallback((assets: ImagePickerAsset[], nextAspect: number) => {
    return new Promise<ImagePickerAsset[] | null>((resolve) => {
      if (resolveRef.current) resolveRef.current(null)
      if (assets.length === 0) {
        resolve(null)
        return
      }
      resolveRef.current = resolve
      void (async () => {
        const prepared = await Promise.all(assets.map(withKnownSize))
        if (resolveRef.current !== resolve || prepared.length === 0) return
        const first = prepared[0]
        if (!first) return
        queue.current = prepared
        accepted.current = []
        aspect.current = nextAspect
        setPending({ asset: first, aspect: nextAspect })
      })()
    })
  }, [])

  const accept = useCallback((asset: ImagePickerAsset) => {
    accepted.current = [...accepted.current, asset]
    const rest = queue.current.slice(1)
    queue.current = rest
    if (rest.length === 0) {
      const done = accepted.current
      queue.current = []
      accepted.current = []
      setPending(null)
      const resolve = resolveRef.current
      resolveRef.current = null
      resolve?.(done)
      return
    }
    const next = rest[0]
    if (!next) {
      const done = accepted.current
      queue.current = []
      accepted.current = []
      setPending(null)
      const resolve = resolveRef.current
      resolveRef.current = null
      resolve?.(done)
      return
    }
    setPending({ asset: next, aspect: aspect.current })
  }, [])

  const cancel = useCallback(() => {
    finish(null)
  }, [finish])

  return { pending, start, accept, cancel }
}
