import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { FormCard } from "@/components/FormCard"
import { translate } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
import { spacing } from "@/theme"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ViewStyle } from "react-native"

const isValidDisplayName = (input: string) => {
  const regex = /^[\p{L}\p{M} \-']+$/u
  return regex.test(input)
}

export default observer(function SetDisplayName() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [localDisplayName, setLocalDisplayName] = useState("")
  const [result, setResult] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const isSavingRef = useRef(false)
  const { authenticationStore } = useStores()
  const { updateDisplayName, fetchDisplayName } = authenticationStore

  const getValidationError = useCallback((name: string) => {
    if (name.length === 0) return translate("setDisplayNameScreen:validation.cantBeBlank")
    if (name.length > 255) return translate("setDisplayNameScreen:validation.tooLong255")
    if (!isValidDisplayName(name)) return translate("setDisplayNameScreen:validation.invalidChars")
    return ""
  }, [])

  const validationError = useMemo(
    () => (isSubmitted ? getValidationError(localDisplayName) : ""),
    [isSubmitted, localDisplayName, getValidationError],
  )

  useEffect(() => {
    setLocalDisplayName("")
    setIsSubmitted(false)
    setResult("")

    const load = async () => {
      await fetchDisplayName()
      setLocalDisplayName(authenticationStore.displayName)
    }
    load()

    return () => {
      setResult("")
    }
  }, [fetchDisplayName, authenticationStore])

  const handleSave = useCallback(async () => {
    if (isSavingRef.current) return

    setIsSubmitted(true)
    setResult("")
    const error = getValidationError(localDisplayName)
    if (error) return

    if (localDisplayName === authenticationStore.displayName) {
      setResult(translate("setDisplayNameScreen:noChangesToSave"))
      setIsSubmitted(false)
      return
    }

    isSavingRef.current = true
    setIsSaving(true)
    try {
      const success = await updateDisplayName(localDisplayName)
      if (success) {
        setResult(translate("setDisplayNameScreen:updatedSuccessfully"))
      } else {
        setResult(translate("setDisplayNameScreen:updateFailed"))
      }
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
      setIsSubmitted(false)
    }
  }, [localDisplayName, authenticationStore, getValidationError, updateDisplayName])

  useHeader(
    {
      titleTx: "setDisplayNameScreen:title",
      leftIcon: "back",
      rightTx: "common:save",
      onLeftPress: () => router.back(),
      onRightPress: isSaving ? undefined : handleSave,
    },
    [handleSave, isSaving],
  )

  return (
    <Screen style={$root} preset="scroll">
      <Text
        tx="setDisplayNameScreen:descriptionProfile"
        style={{ paddingBottom: spacing.md, paddingHorizontal: spacing.md }}
      />
      <FormCard>
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
      </FormCard>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
