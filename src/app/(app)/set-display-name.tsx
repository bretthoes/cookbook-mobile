import React, { FC, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, ViewStyle } from "react-native"
import { Button, Screen, Text, TextField } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { colors, spacing } from "src/theme"
import { router } from "expo-router"
import { useHeader } from "src/utils/useHeader"

export default observer(function SetDisplayName() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const {
    authenticationStore: {
      displayName,
      setDisplayName,
      updateDisplayName,
      fetchDisplayName,
      result,
      setResult,
      submittedSuccessfully,
      setSubmittedSuccessfully,
    },
  } = useStores()
  const displayNameValidator = useMemo(() => {
    if (displayName.length < 1) return "must be at least 1 character"
    if (displayName.length > 30) return "cannot exceed 30 characters"
    return ""
  }, [displayName])

  const error = isSubmitted ? displayNameValidator : ""

  useHeader({
    title: "Set a display name",
    leftIcon: "back",
    rightText: "Save",
    onLeftPress: () => router.back(),
    onRightPress: () => forward(),
  })
  
  useEffect(() => {
    setResult("")
    setSubmittedSuccessfully(false)
    ;(async function load() {
      await fetchDisplayName()
    })()
    return () => {
      setResult("")
    }
  }, [fetchDisplayName])

  useEffect(() => {
    if (submittedSuccessfully) {
      setIsSubmitted(false)
      router.back()
    }
  }, [submittedSuccessfully])

  async function forward() {
    setIsSubmitted(true)

    if (displayNameValidator) return

    // If successful, reset the fields
    await updateDisplayName()
  }

  return (
    <Screen style={$root} preset="scroll">
      <Text
        text="This is how others will see you in the app, instead of your email."
        style={{ marginBottom: spacing.lg }}
      />
      <TextField
        value={displayName}
        onChangeText={setDisplayName}
        helper={error}
        status={error ? "error" : undefined}
        autoCapitalize="none"
        autoComplete="name"
        autoCorrect={false}
        label="Display name"
        placeholder=""
        onSubmitEditing={forward}
      />

      <Text text={`${result}`} preset="formHelper" style={$result} />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $result: TextStyle = {
  color: colors.palette.angry500,
}
