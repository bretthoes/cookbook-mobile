import { spacing, colors } from "app/theme"
import React, { useState } from "react"
import { Dimensions, ScrollView, View, ViewStyle, NativeScrollEvent, NativeSyntheticEvent } from "react-native"
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
  const [activeIndex, setActiveIndex] = useState(0)

  // Handle scroll event to update the active dot based on the current image
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / viewportWidth)
    setActiveIndex(slideIndex)
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {data.map((image, index) => (
          <View key={index} style={{ width: viewportWidth }}>
            <AutoImage source={{ uri: image.getImage }}  maxWidth={viewportWidth} />
          </View>
        ))}
      </ScrollView>
      <View style={$dotContainer}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[
              $dot,
              index === activeIndex ? $activeDot : $inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  )
}

// #region Styles

const $dotContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  marginTop: spacing.sm,
}

const $dot: ViewStyle = {
  width: spacing.xs,
  height: spacing.xs,
  borderRadius: spacing.xs,
  marginHorizontal: spacing.xxs,
}

const $activeDot: ViewStyle = {
  backgroundColor: colors.palette.neutral700,
}

const $inactiveDot: ViewStyle = {
  backgroundColor: colors.palette.neutral300,
}

// #endregion
