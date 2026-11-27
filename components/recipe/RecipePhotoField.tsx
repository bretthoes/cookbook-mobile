import { AutoImage } from "@/components/AutoImage"
import { Button } from "@/components/Button"
import { PressableIcon } from "@/components/Icon"
import { translate } from "@/i18n"
import { ActivityIndicator, View } from "react-native"

type RecipePhotoFieldProps = {
  images: string[]
  isEdit: boolean
  isUploading: boolean
  imageUri: (key: string) => string
  onPick: () => void
  onRemove: (index: number) => void
}

export function RecipePhotoField({
  images,
  isEdit,
  isUploading,
  imageUri,
  onPick,
  onRemove,
}: RecipePhotoFieldProps) {
  return (
    <>
      {isUploading && <ActivityIndicator />}
      {images.length > 0 && (
        <View style={$row}>
          {images.map((image, index) => (
            <View key={index} style={$thumb}>
              <AutoImage source={{ uri: imageUri(image) }} style={$image} />
              <View style={$remove}>
                <PressableIcon icon="x" onPress={() => onRemove(index)} color="#fff" />
              </View>
            </View>
          ))}
        </View>
      )}
      <Button
        text={
          isEdit
            ? translate("recipeFormScreen:addPhotos", { current: images.length })
            : translate("recipeFormScreen:addPhotosMax")
        }
        onPress={onPick}
        disabled={isUploading || images.length >= 6}
      />
    </>
  )
}

const $row = {
  flexDirection: "row" as const,
  flexWrap: "wrap" as const,
  justifyContent: "center" as const,
}

const $thumb = { margin: 5 }

const $image = { width: 100, height: 100 }

const $remove = {
  position: "absolute" as const,
  top: 4,
  right: 4,
  backgroundColor: "rgba(0,0,0,0.5)",
  borderRadius: 12,
  padding: 2,
}
