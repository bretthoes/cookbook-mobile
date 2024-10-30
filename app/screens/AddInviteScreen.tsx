import React, { FC, useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Screen, Text, TextField } from "app/components"
import { useStores } from "app/models"
import { spacing } from "app/theme"

interface AddInviteScreenProps extends AppStackScreenProps<"AddInvite"> {}

export const AddInviteScreen: FC<AddInviteScreenProps> = observer(function AddInviteScreen() {
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
    <Screen style={$root} preset="auto" safeAreaEdges={["top"]}>
      <TextField
        value={inviteEmail}
        onChangeText={setInviteEmail}
        containerStyle={$textField}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        label={`Invite someone to ${currentCookbook?.title}:`}
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