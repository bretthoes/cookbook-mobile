import type { ThemedStyle } from "@/theme"
import type { TextStyle, ViewStyle } from "react-native"

export const $container: ThemedStyle<ViewStyle> = (theme) => ({
  paddingTop: theme.spacing.xl,
})

export const $listContainer: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  marginHorizontal: theme.spacing.lg,
  borderRadius: theme.spacing.md,
})

export const $itemContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: theme.spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.background,
  minHeight: 80,
})

export const $iconContainer: ThemedStyle<ViewStyle> = (theme) => ({
  width: 48,
  height: 48,
  backgroundColor: theme.colors.background,
  alignItems: "center",
  justifyContent: "center",
  marginRight: theme.spacing.md,
  borderRadius: 24,
})

export const $textContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  marginRight: theme.spacing.sm,
})

export const $itemTitle: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 16,
  marginBottom: theme.spacing.xs,
})

export const $itemDescription: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  fontSize: 14,
})
