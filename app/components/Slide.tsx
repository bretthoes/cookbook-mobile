import { spacing } from "app/theme"
import React from "react"
import { Dimensions, ScrollView, View, ViewStyle } from "react-native"
import { AutoImage } from "./AutoImage"
import { RecipeImage } from "app/models/RecipeImage"

const { width: viewportWidth } = Dimensions.get("window")

export interface SlideProps {
  /**
   * The images to be displayed in the carousel slide
   */
  data: RecipeImage[],
}

/**
 * A slide component to display an array of images.
 * @param {SlideProps} props - The props for the `Slide` component.
 * @returns {JSX.Element} The rendered `Slide` component.
 */
export function Slide(props: SlideProps) {
  const { data } = props


  return <ScrollView
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={$scrollViewContent}
  >
    {data.map((image, index) => (
      <View key={index} style={{ width: viewportWidth }}>
        <AutoImage source={{ uri: image.getImage }} maxWidth={viewportWidth} maxHeight={viewportWidth} />
      </View>
    ))}
  </ScrollView>
}

// #region Styles

const $scrollViewContent: ViewStyle = {
  marginTop: spacing.md,
}

// #endregion