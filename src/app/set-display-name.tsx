import React, { FC, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, View, ViewStyle } from "react-native"
import { Button, Screen, Text, TextField, UseCase } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { colors, spacing } from "src/theme"
import { router } from "expo-router"
import { useHeader } from "src/utils/useHeader"

export default observer(function SetDisplayName() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const {
    authenticationStore: { displayName, setDisplayName },
  } = useStores()
  const displayNameValidator = useMemo(() => {
    if (displayName.length > 60) return "cannot exceed 60 characters"
    if (!/^[\p{L}\p{M} \-']+$/u.test(displayName)) {
      return "can only contain letters, spaces, hyphens, and apostrophes"
    }
    return ""
  }, [displayName])

  const error = isSubmitted ? displayNameValidator : ""

  async function forward() {
    setIsSubmitted(true)

    if (displayNameValidator) return

    // If successful, reset the fields
    setIsSubmitted(false)

    // navigate to email verification
    router.push("/email-verification")
  }

  return (
    <Screen style={$root} safeAreaEdges={["top"]} preset="scroll">
      <View style={$header}>
        <Text testID="login-heading" text="Set a display name" preset="heading" />
        <Text
          text="This is optional, but you can set a display name. This is how others will see you, instead of your email. You can change this any time in the app."
          preset="subheading"
          style={$enterDetails}
        />
        {<Text text="No special characters!" size="sm" weight="light" style={$hint} />}
      </View>
      <UseCase>
        <TextField
          value={displayName}
          onChangeText={setDisplayName}
          containerStyle={$textField}
          helper={error}
          status={error ? "error" : undefined}
          autoCapitalize="none"
          autoComplete="name"
          autoCorrect={false}
          label="Display name (optional)"
          placeholder="Bob"
          onSubmitEditing={forward}
        />
      </UseCase>
      <View style={{ paddingHorizontal: spacing.md }}>
        <Button text="Next" style={$tapButton} preset="reversed" onPress={forward} />
      </View>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
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

const $header: TextStyle = {
  marginTop: spacing.xxxl,
  marginBottom: spacing.sm,
  paddingHorizontal: spacing.md,
}

const $enterDetails: TextStyle = {
  marginBottom: spacing.lg,
}
