import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { UseCase } from "@/components/UseCase"
import { translate } from "@/i18n"
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
    if (name.length === 0) return translate("setDisplayNameScreen:validation.cantBeBlank")
    if (name.length > 255) return translate("setDisplayNameScreen:validation.tooLong255")
    if (!isValidDisplayName(name))
      return translate("setDisplayNameScreen:validation.invalidChars")
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
      setResult(translate("setDisplayNameScreen:noChangesToSave"))
      setIsSubmitted(false)
      return
    }

    // Update the store's display name with the local value
    setDisplayName(localDisplayName)

    // Call the update function
    const success = await updateDisplayName()
    if (success) {
      setResult(translate("setDisplayNameScreen:updatedSuccessfully"))
    } else {
      setResult(translate("setDisplayNameScreen:updateFailed"))
    }
    setIsSubmitted(false)
  }

  useHeader(
    {
      titleTx: "setDisplayNameScreen:title",
      leftIcon: "back",
      rightTx: "common:save",
      onLeftPress: () => router.back(),
      onRightPress: handleSave,
    },
    [localDisplayName],
  )

  return (
    <Screen style={$root} preset="scroll">
      <Text
        tx="setDisplayNameScreen:descriptionProfile"
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
          labelTx="setDisplayNameScreen:label"
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
