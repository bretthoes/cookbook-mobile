import { spacing, colors } from "src/theme"
import React, { useState } from "react"
import {
  Dimensions,
  ScrollView,
  View,
  ViewStyle,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native"
import { RecipeImage } from "src/models/Recipe"
import { AutoImage } from "../AutoImage"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"

const { width: viewportWidth } = Dimensions.get("window")

export interface RecipeImagesProps {
  data: RecipeImage[]
}

export function RecipeImages(props: RecipeImagesProps) {
  const { data } = props
  const { themed } = useAppTheme()
  const shouldShowPagination = data.length > 1
  const [activeIndex, setActiveIndex] = useState(0)

  const $themedDotContainer = React.useMemo(() => themed($dotContainer), [themed])
  const $themedDot = React.useMemo(() => themed($dot), [themed])
  const $themedActiveDot = React.useMemo(() => themed($activeDot), [themed])
  const $themedInactiveDot = React.useMemo(() => themed($inactiveDot), [themed])

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
            <AutoImage source={{ uri: image.getImage }} maxWidth={viewportWidth} />
          </View>
        ))}
      </ScrollView>
      {shouldShowPagination && (
        <View style={$themedDotContainer}>
          {data.map((_, index) => (
            <View
              key={index}
              style={[$themedDot, index === activeIndex ? $themedActiveDot : $themedInactiveDot]}
            />
          ))}
        </View>
      )}
    </View>
  )
}

// #region Styles

const $dotContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  justifyContent: "center",
  marginTop: theme.spacing.sm,
})

const $dot: ThemedStyle<ViewStyle> = (theme) => ({
  width: theme.spacing.xs,
  height: theme.spacing.xs,
  borderRadius: theme.spacing.xs,
  marginHorizontal: theme.spacing.xxs,
})

const $activeDot: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.icon,
})

const $inactiveDot: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.tintInactive,
})

// #endregion
