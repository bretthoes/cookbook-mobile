import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { TextStyle, ViewStyle, View } from "react-native"
import { Screen, Text, Button, TextField } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { spacing } from "src/theme"

export default observer(function Invitations() {
  const { 
    cookbookStore: { currentCookbook },
    invitationStore: { 
      invite,
      inviteEmail,
      setInviteEmail, 
      validationError,
      result,
      setResult
    }
  } = useStores()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const error = isSubmitted ? validationError : ""

  useEffect(() => {
    setResult("")
    setInviteEmail("")
  }, [])

  async function send() {
    setIsSubmitted(true)
    if (validationError) return
    const cookbookId = currentCookbook?.id ?? 0;
    await invite(cookbookId)
    setIsSubmitted(false)
  }

  return (
    <Screen style={$root} preset="fixed" safeAreaEdges={["top"]}>
      <Text testID="login-heading" text="Invite a Friend" preset="heading" style={$logIn} />
      <Text
        text={`Invite a friend to join "${currentCookbook?.title}". Your friend needs to have an account to join you.`}
        preset="default"
        style={$enterDetails}
      />
      <TextField
        value={inviteEmail}
        onChangeText={setInviteEmail}
        containerStyle={$textField}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="Enter an email address"
        helper={error}
        status={error ? "error" : undefined}
      />
      <Text text={`${result}`} preset="formHelper" />
      <Button
        text="Send"
        style={$tapButton}
        preset="reversed"
        onPress={send}
      />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  paddingHorizontal: spacing.sm,
  paddingTop: spacing.lg,
}

const $textField: ViewStyle = {
  marginBottom: spacing.lg,
}

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
}

const $logIn: TextStyle = {
  marginBottom: spacing.sm,
  marginTop: spacing.xxl,
}

const $enterDetails: TextStyle = {
  marginBottom: spacing.lg,
}
