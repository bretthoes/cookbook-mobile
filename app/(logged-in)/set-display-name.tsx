import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { UseCase } from "@/components/UseCase"
import { useStores } from "@/models/helpers/useStores"
import { spacing } from "@/theme"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { ViewStyle } from "react-native"

const isValidDisplayName = (input: string) => {
  const regex = /^[\p{L}\p{M} \-']+$/u
  return regex.test(input)
}

export default observer(function SetDisplayName() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [localDisplayName, setLocalDisplayName] = useState("")
  const [result, setResult] = useState("")
  const {
    authenticationStore: { displayName, setDisplayName, updateDisplayName, fetchDisplayName },
  } = useStores()

  const getValidationError = useCallback((name: string) => {
    if (name.length === 0) return "can't be blank"
    if (name.length > 255) return "cannot exceed 255 characters"
    if (!isValidDisplayName(name))
      return "can only contain letters, spaces, hyphens, and apostrophes"
    return ""
  }, [])

  const validationError = useMemo(
    () => (isSubmitted ? getValidationError(localDisplayName) : ""),
    [isSubmitted, localDisplayName, getValidationError],
  )

  useEffect(() => {
    // Reset state when component mounts
    setLocalDisplayName("")
    setIsSubmitted(false)
    setResult("")

    // Fetch the current display name
    const load = async () => {
      await fetchDisplayName()
      // Set the local display name to the fetched value
      setLocalDisplayName(displayName)
    }
    load()

    return () => {
      setResult("")
    }
  }, [fetchDisplayName, displayName])

  const handleSave = async () => {
    setIsSubmitted(true)
    setResult("")
    const error = getValidationError(localDisplayName)
    if (error) return

    // Check if the local display name is already equal to the store's display name
    if (localDisplayName === displayName) {
      setResult("No changes to save.")
      setIsSubmitted(false)
      return
    }

    // Update the store's display name with the local value
    setDisplayName(localDisplayName)

    // Call the update function
    const success = await updateDisplayName()
    if (success) {
      setResult("Display name updated successfully!")
    } else {
      setResult("Failed to update display name, please try again.")
    }
    setIsSubmitted(false)
  }

  useHeader(
    {
      title: "Set a display name",
      leftIcon: "back",
      rightText: "Save",
      onLeftPress: () => router.back(),
      onRightPress: handleSave,
    },
    [localDisplayName],
  )

  return (
    <Screen style={$root} preset="scroll">
      <Text
        text="This is how others will see you in the app, instead of your email."
        style={{ paddingBottom: spacing.md, paddingHorizontal: spacing.md }}
      />
      <UseCase>
        <TextField
          value={localDisplayName}
          onChangeText={setLocalDisplayName}
          helper={validationError}
          status={validationError ? "error" : undefined}
          autoCapitalize="none"
          autoComplete="name"
          autoCorrect={false}
          label="Display name"
          placeholder=""
        />
        <Text text={`${result}`} preset="formHelper" />
      </UseCase>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
