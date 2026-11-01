import { AutoImage } from "@/components/AutoImage"
import { Button } from "@/components/Button"
import { CustomBackButton } from "@/components/CustomBackButton"
import { Divider } from "@/components/Divider"
import { ItemNotFound } from "@/components/ItemNotFound"
import { MoreButton } from "@/components/MoreButton"
import { Popover } from "@/components/Popover"
import { DirectionText } from "@/components/Recipe/DirectionText"
import { IngredientItem } from "@/components/Recipe/IngredientItem"
import { RecipeDetailsSkeleton } from "@/components/Recipe/RecipeDetailsSkeleton"
import { RecipeImages } from "@/components/Recipe/RecipeImages"
import RecipeSummary from "@/components/Recipe/RecipeSummary"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { Switch } from "@/components/Toggle"
import {
  findCachedRecipeBrief,
  useDeleteRecipeMutation,
  useRecordRecipeMadeMutation,
  useRecipeQuery,
} from "@/hooks/queries/useRecipesQuery"
import { useRecipeMadeCooldown } from "@/hooks/useRecipeMadeCooldown"
import { usePrintRecipe } from "@/hooks/usePrintRecipe"
import type { TxKeyPath } from "@/i18n"
import { useMembershipStore } from "@/stores/membershipStore"
import { canDeleteAnyRecipe, canEditAnyRecipe } from "@/utils/membershipTier"
import { getRecipeMadeHoursAgo } from "@/utils/recipeMadeCooldown"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import * as Haptics from "expo-haptics"
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake"
import { useQueryClient } from "@tanstack/react-query"
import { router, useLocalSearchParams } from "expo-router"
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Alert, ImageStyle, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function RecipeScreen() {
  const ownMembership = useMembershipStore((s) => s.ownMembership)
  const { id } = useLocalSearchParams<{ id: string }>()
  const recipeId = id ?? ""
  const queryClient = useQueryClient()
  const { data: selected, isPending, isError } = useRecipeQuery(recipeId)
  const cachedTitle = useMemo(
    () => findCachedRecipeBrief(queryClient, recipeId)?.title,
    [queryClient, recipeId],
  )
  const deleteRecipeMutation = useDeleteRecipeMutation()
  const recordRecipeMadeMutation = useRecordRecipeMadeMutation()
  const { canRecordMade, cooldownEndsAt, recordCooldown } = useRecipeMadeCooldown(recipeId)
  const madeHoursAgo = cooldownEndsAt == null ? null : getRecipeMadeHoursAgo(cooldownEndsAt)
  const { themed } = useAppTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const printRecipe = usePrintRecipe()
  const [popoverVisible, setPopoverVisible] = useState(false)
  const isRecipeAuthor = selected?.isAuthor === true
  const canEdit = isRecipeAuthor || canEditAnyRecipe(ownMembership?.tier)
  const canDelete = isRecipeAuthor || canDeleteAnyRecipe(ownMembership?.tier)
  const recipeHasImages = selected?.images?.[0]

  const $themedListItemStyle = React.useMemo(() => themed($listItemStyle), [themed])
  const $themedBorderTop = React.useMemo(() => themed($borderTop), [themed])
  const $themedBorderBottom = React.useMemo(() => themed($borderBottom), [themed])
  const $themedSeparator = React.useMemo(() => themed($separator), [themed])
  const $themedDirectionsContainer = React.useMemo(() => themed($directionsContainer), [themed])
  const $themedIngredientsContainer = React.useMemo(() => themed($ingredientsContainer), [themed])
  const $themedSeparatorAboveIngredients = React.useMemo(
    () => themed($separatorAboveIngredients),
    [themed],
  )
  const $themedSeparatorBelowImages = React.useMemo(() => themed($separatorBelowImages), [themed])
  const $themedMadeSection = React.useMemo(() => themed($madeSection), [themed])
  const $themedMadeThisAgo = React.useMemo(() => themed($madeThisAgo), [themed])
  const [cookMode, setCookMode] = useState(false)
  const [completedDirections, setCompletedDirections] = useState<Set<number>>(new Set())

  const toggleDirectionCompleted = (index: number) => {
    setCompletedDirections((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  useEffect(() => {
    if (cookMode) activateKeepAwakeAsync()
    else deactivateKeepAwake()
    return () => {
      deactivateKeepAwake()
    }
  }, [cookMode])

  const handlePressEdit = useCallback(() => {
    router.push(`/(logged-in)/recipe/${selected?.id}/edit`)
  }, [selected?.id])

  const handlePressDelete = useCallback(async () => {
    Alert.alert(t("recipeDetailScreen:deleteTitle"), t("recipeDetailScreen:deleteMessage"), [
      {
        text: t("common:cancel"),
        style: "cancel",
      },
      {
        text: t("recipeDetailScreen:deleteButton"),
        style: "destructive",
        onPress: () => {
          router.back()
          deleteRecipeMutation.mutate(recipeId, {
            onError: () => {
              Alert.alert(t("common:error"), t("recipeDetailScreen:deleteFailed"))
            },
          })
        },
      },
    ])
  }, [deleteRecipeMutation, recipeId, t])

  const handlePressMore = () => setPopoverVisible(true)

  const handlePressMadeThis = useCallback(() => {
    recordRecipeMadeMutation.mutate(recipeId, {
      onSuccess: () => {
        void recordCooldown()
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      },
      onError: () => {
        Alert.alert(t("common:error"), t("recipeDetailsScreen:madeThisFailed"))
      },
    })
  }, [recordRecipeMadeMutation, recordCooldown, recipeId, t])

  const popoverOptions = useMemo(
    () => [
      ...(canEdit
        ? [
            {
              key: "editRecipe",
              tx: "recipeDetailsScreen:editRecipe" as const,
              leftIcon: "settings" as const,
              onPress: handlePressEdit,
            },
          ]
        : []),
      {
        key: "exportRecipe",
        tx: "recipeDetailsScreen:exportRecipe" as const,
        leftIcon: "share" as const,
        disabled: true,
        onPress: () => {},
      },
      {
        key: "printRecipe",
        tx: "recipeDetailsScreen:printRecipe" as const,
        leftIcon: "printer" as const,
        onPress: () => {
          if (selected) printRecipe(selected)
        },
      },
      {
        key: "deleteRecipe",
        tx: "recipeDetailsScreen:deleteRecipe" as const,
        leftIcon: "x" as const,
        destructive: true,
        onPress: handlePressDelete,
      },
    ],
    [canEdit, handlePressEdit, handlePressDelete, printRecipe, selected],
  )

  if (isError) {
    return (
      <>
        <Divider size={spacing.xxxl} />
        <ItemNotFound messageTx="itemNotFound:recipe" />
      </>
    )
  }

  if (isPending && !selected) {
    return <RecipeDetailsSkeleton title={cachedTitle} onBack={() => router.back()} />
  }

  const popoverAnchorTop = insets.top + (recipeHasImages ? spacing.xl : spacing.sm) + 40

  return (
    <>
      <Popover
        visible={popoverVisible}
        onDismiss={() => setPopoverVisible(false)}
        options={popoverOptions}
        anchorTop={popoverAnchorTop}
      />
      <Screen safeAreaEdges={recipeHasImages ? [] : ["top"]} preset="scroll">
        <CustomBackButton
          onPress={() => router.back()}
          top={recipeHasImages ? spacing.xl : spacing.sm} // TODO check both recipeHasImages AND the image loaded properly... We get warnings when there's a size issue (image loaded from URL but is way too big) or its found but the file is 0kb etc
        />
        {(canEdit || canDelete) && (
          <MoreButton onPress={handlePressMore} top={recipeHasImages ? spacing.xl : spacing.sm} />
        )}
        {selected?.images && <RecipeImages data={selected?.images} />}
        {recipeHasImages && <View style={$themedSeparatorBelowImages} />}
        {selected && <RecipeSummary recipe={selected} />}

        {selected && <View style={$themedSeparatorAboveIngredients} />}

        {selected && (
          <View style={$themedIngredientsContainer}>
            <Text
              preset="subheading"
              tx="recipeDetailsScreen:ingredients"
              style={{ paddingBottom: spacing.md }}
            />
            {(() => {
              const sections = [...(selected.ingredientSections ?? [])].sort(
                (a, b) => a.ordinal - b.ordinal,
              )
              const totalLines = sections.reduce((n, s) => n + s.ingredients.length, 0)
              let lineIndex = 0
              const nodes: React.ReactNode[] = []
              for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
                const section = sections[sectionIndex]
                const lines = [...section.ingredients].sort((a, b) => a.ordinal - b.ordinal)
                if (section.title.trim()) {
                  nodes.push(
                    <Text
                      key={`section-title-${sectionIndex}-${section.ordinal}`}
                      preset="formLabel"
                      style={{ paddingTop: spacing.sm, paddingBottom: spacing.xs }}
                      text={section.title}
                    />,
                  )
                }
                for (let ingredientIndex = 0; ingredientIndex < lines.length; ingredientIndex++) {
                  const item = lines[ingredientIndex]
                  const isFirst = lineIndex === 0
                  const isLast = lineIndex === totalLines - 1
                  nodes.push(
                    <IngredientItem
                      key={`ingredient-${sectionIndex}-${ingredientIndex}-${lineIndex}-${item.ordinal}`}
                      ingredient={item}
                      index={lineIndex}
                      isFirst={isFirst}
                      isLast={isLast}
                    />,
                  )
                  lineIndex += 1
                }
              }
              return nodes
            })()}
          </View>
        )}

        {selected &&
          (() => {
            const directions = selected.directions ?? []
            return (
              <View style={$themedDirectionsContainer}>
                <View style={$directionsHeaderRow}>
                  <Text preset="subheading" tx="recipeDetailsScreen:directions" />
                  <View style={$cookModeRow}>
                    <Text tx="recipeDetailScreen:keepScreenOn" />
                    <Switch value={cookMode} onValueChange={setCookMode} />
                  </View>
                </View>
                {directions.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      $themedListItemStyle,
                      index === 0 && $themedBorderTop,
                      index === directions.length - 1 && $themedBorderBottom,
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => toggleDirectionCompleted(index)}
                      style={[$directionItem, index !== directions.length - 1 && $themedSeparator]}
                    >
                      <DirectionText
                        ordinal={item?.ordinal}
                        text={item?.text ?? ""}
                        completed={completedDirections.has(index)}
                      />
                      {item?.image ? (
                        <AutoImage
                          source={{ uri: item.image }}
                          style={$directionImage as ImageStyle}
                        />
                      ) : null}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )
          })()}

        {selected ? (
          <View style={$themedMadeSection}>
            <View style={$madeAction}>
              <Button
                tx="recipeDetailsScreen:madeThis"
                onPress={handlePressMadeThis}
                disabled={!canRecordMade}
                disabledStyle={$madeThisButtonDisabled}
                loading={recordRecipeMadeMutation.isPending}
              />
              {madeHoursAgo != null ? (
                <Text {...madeThisAgoTx(madeHoursAgo)} size="xs" style={$themedMadeThisAgo} />
              ) : null}
            </View>
            <MadeCountLabel count={selected.madeCount ?? 0} recipeId={recipeId} />
          </View>
        ) : null}
      </Screen>
    </>
  )
}

const MADE_COUNT_TICK_MS = 200
const MADE_COUNT_TICK_DELAY_MS = 220

function madeThisAgoTx(hoursAgo: number): { tx: TxKeyPath; txOptions?: { count: number } } {
  if (hoursAgo < 1) return { tx: "recipeDetailsScreen:madeThisLessThanHourAgo" }
  return {
    tx:
      hoursAgo === 1
        ? "recipeDetailsScreen:madeThisHoursAgo"
        : "recipeDetailsScreen:madeThisHoursAgo_plural",
    txOptions: { count: hoursAgo },
  }
}

function splitMadeCountLabel(label: string, count: number) {
  const countLabel = String(count)
  const countIndex = label.indexOf(countLabel)
  if (countIndex < 0) return null
  return {
    before: label.slice(0, countIndex),
    after: label.slice(countIndex + countLabel.length),
  }
}

function MadeCountLabel({ count, recipeId }: { count: number; recipeId: string }) {
  const { t } = useTranslation()
  const label = t("recipeDetailsScreen:madeCount", { count })
  const parts = splitMadeCountLabel(label, count)

  if (!parts) {
    return <Text tx="recipeDetailsScreen:madeCount" txOptions={{ count }} style={$madeCountText} />
  }

  return (
    <View accessible accessibilityRole="text" accessibilityLabel={label} style={$madeCountRow}>
      {parts.before ? <Text text={parts.before} /> : null}
      <RollingNumber key={recipeId} value={count} />
      {parts.after ? <Text text={parts.after} /> : null}
    </View>
  )
}

function RollingNumber({ value }: { value: number }) {
  const [from, setFrom] = useState(value)
  const [lineHeight, setLineHeight] = useState(0)
  const offset = useSharedValue(0)

  useLayoutEffect(() => {
    if (from === value) return
    if (lineHeight <= 0) {
      setFrom(value)
      return
    }
    offset.value = 0
    offset.value = withDelay(
      MADE_COUNT_TICK_DELAY_MS,
      withTiming(
        -lineHeight,
        { duration: MADE_COUNT_TICK_MS, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setFrom)(value)
        },
      ),
    )
    return () => {
      cancelAnimation(offset)
    }
  }, [from, lineHeight, offset, value])

  const $tick = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }))

  const onMeasure = (height: number) => {
    const next = Math.ceil(height)
    setLineHeight((current) => (current === next ? current : next))
  }

  if (lineHeight <= 0) {
    return (
      <Text text={String(value)} onLayout={(event) => onMeasure(event.nativeEvent.layout.height)} />
    )
  }

  return (
    <View style={[$tickWindow, { height: lineHeight }]} collapsable={false}>
      <Animated.View style={[$tickColumn, $tick]}>
        <Text
          text={String(from)}
          onLayout={(event) => onMeasure(event.nativeEvent.layout.height)}
        />
        <Text text={String(value)} />
      </Animated.View>
    </View>
  )
}

// #region Styles

const $listItemStyle: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  paddingHorizontal: theme.spacing.md,
})

const $borderTop: ThemedStyle<ViewStyle> = (theme) => ({
  borderTopLeftRadius: theme.spacing.xs,
  borderTopRightRadius: theme.spacing.xs,
})

const $borderBottom: ThemedStyle<ViewStyle> = (theme) => ({
  borderBottomLeftRadius: theme.spacing.xs,
  borderBottomRightRadius: theme.spacing.xs,
})

const $directionsContainer: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.md,
  paddingBottom: theme.spacing.xl,
})

const $directionsHeaderRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingBottom: spacing.md,
}

const $cookModeRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
}

const $separatorBelowImages: ThemedStyle<ViewStyle> = (theme) => ({
  height: 1,
  backgroundColor: theme.colors.separator,
  marginHorizontal: theme.spacing.sm,
  marginTop: theme.spacing.xs,
  marginBottom: theme.spacing.sm,
})

const $separatorAboveIngredients: ThemedStyle<ViewStyle> = (theme) => ({
  height: 1,
  backgroundColor: theme.colors.separator,
  marginHorizontal: theme.spacing.sm,
  marginTop: theme.spacing.md,
  marginBottom: theme.spacing.xs,
})

const $ingredientsContainer: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.md,
  paddingTop: theme.spacing.xs,
  paddingBottom: theme.spacing.lg,
})

const $directionItem: ViewStyle = {
  padding: spacing.sm,
}

const $separator: ThemedStyle<ViewStyle> = (theme) => ({
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.separator,
})

const $directionImage: ImageStyle = {
  width: 160,
  height: 160,
  borderRadius: 8,
  marginTop: spacing.sm,
}

const $madeSection: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.md,
  paddingBottom: theme.spacing.xxl,
  gap: theme.spacing.md,
  alignItems: "center",
})

const $madeAction: ViewStyle = {
  alignSelf: "stretch",
  alignItems: "center",
  gap: spacing.xs,
}

const $madeThisButtonDisabled: ViewStyle = {
  opacity: 0.45,
}

const $madeThisAgo: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  textAlign: "center",
})

const $madeCountRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
}

const $tickWindow: ViewStyle = {
  overflow: "hidden",
}

const $tickColumn: ViewStyle = {
  alignItems: "center",
}

const $madeCountText: TextStyle = {
  textAlign: "center",
}

// #endregion
