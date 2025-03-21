import React, { FC, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, ViewStyle } from "react-native"
import { Button, Screen, Text, TextField } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { colors, spacing } from "src/theme"
import { router } from "expo-router"

export default observer(function SetDisplayName() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const {
    authenticationStore: { displayName, setDisplayName },
  } = useStores()
  const displayNameValidator = useMemo(() => {
    if (displayName.length < 1) return "must be at least 1 character"
    if (displayName.length > 30) return "cannot exceed 30 characters"
    return ""
  }, [displayName])

  const error = isSubmitted ? displayNameValidator : ""

  async function forward() {
    setIsSubmitted(true)

    if (displayNameValidator) return

    // If successful, reset the fields
    setIsSubmitted(false)

    router.back()
  }

  return (
    <Screen style={$root} preset="scroll">
      <Text testID="login-heading" text="Set a display name" preset="heading" style={$logIn} />
      <Text
        text="This is how others will see you in the app, instead of your email."
        preset="subheading"
        style={$enterDetails}
      />
      {<Text text="No special characters!" size="sm" weight="light" style={$hint} />}
      <TextField
        value={displayName}
        onChangeText={setDisplayName}
        containerStyle={$textField}
        helper={error}
        status={error ? "error" : undefined}
        autoCapitalize="none"
        autoComplete="name"
        autoCorrect={false}
        label="Display name"
        placeholder=""
        onSubmitEditing={forward}
      />

      <Button text="Save" style={$tapButton} preset="reversed" onPress={forward} />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $hint: TextStyle = {
  color: colors.tint,
  marginBottom: spacing.md,
}

const $textField: ViewStyle = {
  marginBottom: spacing.lg,
}

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
  marginBottom: spacing.xs,
}

const $logIn: TextStyle = {
  marginBottom: spacing.sm,
  marginTop: spacing.xxl,
}

const $enterDetails: TextStyle = {
  marginBottom: spacing.lg,
}
