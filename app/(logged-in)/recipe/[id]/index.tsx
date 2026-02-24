import { Popover } from "@/components/Popover"
import { CustomBackButton } from "@/components/CustomBackButton"
import { Divider } from "@/components/Divider"
import { ItemNotFound } from "@/components/ItemNotFound"
import { translate } from "@/i18n"
import { ListItem } from "@/components/ListItem"
import { MoreButton } from "@/components/MoreButton"
import { DirectionText } from "@/components/Recipe/DirectionText"
import { IngredientItem } from "@/components/Recipe/IngredientItem"
import { RecipeImages } from "@/components/Recipe/RecipeImages"
import RecipeSummary from "@/components/Recipe/RecipeSummary"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { Switch } from "@/components/Toggle"
import { useStores } from "@/models/helpers/useStores"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake"
import { router, useLocalSearchParams } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Alert, View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default observer(function Recipe() {
  const {
    recipeStore: { selected, delete: deleteRecipe, single },
    membershipStore: { ownMembership },
  } = useStores()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { themed } = useAppTheme()
  const insets = useSafeAreaInsets()
  const [isLoading, setIsLoading] = useState(false)
  const [popoverVisible, setPopoverVisible] = useState(false)
  const isRecipeAuthor =
    ownMembership?.email?.toLowerCase() === selected?.authorEmail?.toLowerCase() &&
    !!ownMembership?.email
  const canEdit = isRecipeAuthor || ownMembership?.isOwner || ownMembership?.canUpdateRecipe
  const canDelete = ownMembership?.canDeleteRecipe
  const recipeHasImages = selected?.images[0]

  const $themedListItemStyle = React.useMemo(() => themed($listItemStyle), [themed])
  const $themedBorderTop = React.useMemo(() => themed($borderTop), [themed])
  const $themedBorderBottom = React.useMemo(() => themed($borderBottom), [themed])
  const $themedDirectionsContainer = React.useMemo(() => themed($directionsContainer), [themed])
  const $themedIngredientsContainer = React.useMemo(() => themed($ingredientsContainer), [themed])
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

  useEffect(() => {
    setIsLoading(true)
    const fetchData = async () => {
      await single(Number(id))
    }
    fetchData()
    setIsLoading(false)
  }, [id, single])

  const handlePressEdit = () => {
    router.push(`../recipe/${selected?.id}/edit`)
  }

  const handlePressDelete = async () => {
    Alert.alert(
      translate("recipeDetailScreen:deleteTitle"),
      translate("recipeDetailScreen:deleteMessage"),
      [
        {
          text: translate("common:cancel"),
          style: "cancel",
        },
        {
          text: translate("recipeDetailScreen:deleteButton"),
          style: "destructive",
          onPress: async () => {
            await deleteRecipe()
          },
        },
      ],
    )
  }

  const handlePressMore = () => setPopoverVisible(true)

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
        leftIcon: "view" as const,
        disabled: true,
        onPress: () => {},
      },
      {
        key: "deleteRecipe",
        tx: "recipeDetailsScreen:deleteRecipe" as const,
        leftIcon: "x" as const,
        destructive: true,
        onPress: handlePressDelete,
      },
    ],
    [canEdit],
  )

  if (!selected && !isLoading)
    return (
      <>
        <Divider size={spacing.xxxl} />
        <ItemNotFound messageTx="itemNotFound:recipe" />
      </>
    )

  const popoverAnchorTop = insets.top + (recipeHasImages ? spacing.xl : spacing.sm) + 40

  return isLoading ? (
    <ActivityIndicator />
  ) : (
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
        {selected && <RecipeSummary recipe={selected} />}

        {selected && (
          <View style={$themedIngredientsContainer}>
            <Text
              preset="subheading"
              tx="recipeDetailsScreen:ingredients"
              style={{ paddingBottom: spacing.md }}
            />
            {selected.ingredients.map((item, index) => (
              <IngredientItem
                key={index}
                ingredient={item}
                index={index}
                isFirst={index === 0}
                isLast={index === selected.ingredients.length - 1}
              />
            ))}
          </View>
        )}

        {selected && (
          <View style={$themedDirectionsContainer}>
            <View style={$directionsHeaderRow}>
              <Text preset="subheading" tx="recipeDetailsScreen:directions" />
              <View style={$cookModeRow}>
                <Text tx="recipeDetailScreen:keepScreenOn" />
                <Switch value={cookMode} onValueChange={setCookMode} />
              </View>
            </View>
            {selected.directions.map((item, index) => (
              <View
                key={index}
                style={[
                  $themedListItemStyle,
                  index === 0 && $themedBorderTop,
                  index === selected.directions.length - 1 && $themedBorderBottom,
                ]}
              >
                <ListItem
                  onPress={() => toggleDirectionCompleted(index)}
                  style={{ padding: spacing.sm }}
                  LeftComponent={
                    <DirectionText
                      ordinal={item?.ordinal}
                      text={item?.text ?? ""}
                      completed={completedDirections.has(index)}
                    />
                  }
                  height={spacing.xl}
                  bottomSeparator={index !== selected.directions.length - 1}
                  topSeparator={index !== 0}
                />
              </View>
            ))}
          </View>
        )}
      </Screen>
    </>
  )
})

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

const $ingredientsContainer: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.md,
  paddingTop: theme.spacing.lg,
  paddingBottom: theme.spacing.lg,
})

// #endregion
