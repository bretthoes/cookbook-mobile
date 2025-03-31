import React, { FC, useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, View, ViewStyle } from "react-native"
import { Button, Header, Screen, Text, TextField, UseCase } from "src/components"
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
    <Screen style={$root} preset="scroll">
        <Header
          leftIcon="back"
          onLeftPress={() => router.back()}
          rightText="Next"
          onRightPress={forward}
        />
        <Text
          testID="set-display-name-heading"
          text="Set a display name"
          preset="subheading"
          style={$content}
        />
        <Text
          testID="set-display-name-description"
          text="This is optional, but you can set a display name. This is how others will see you, instead of your email. You can change this any time in the app."
          style={$content}
        />
        <UseCase>
          {<Text text="No special characters, please!" size="sm" weight="light" style={$hint} />}
          <TextField
            value={displayName}
            onChangeText={setDisplayName}
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
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $content: ViewStyle = {
  paddingHorizontal: spacing.md,
}

const $hint: TextStyle = {
  color: colors.tint,
  paddingBottom: spacing.md,
}

