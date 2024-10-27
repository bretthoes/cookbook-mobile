import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Screen, Text, TextField } from "app/components"
import { useStores } from "app/models"
import { spacing } from "app/theme"

interface CookbookInviteScreenProps extends AppStackScreenProps<"CookbookInvite"> {}

// TODO rename AddInviteScreen
export const CookbookInviteScreen: FC<CookbookInviteScreenProps> = observer(function CookbookInviteScreen() {
  const { 
    cookbookStore: { currentCookbook },
    invitationStore: { 
      invite, inviteEmail, setInviteEmail, validationError, result
    }
  } = useStores()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const error = isSubmitted ? validationError : ""

  async function send() {
    setIsSubmitted(true)
    if (validationError) return
    const cookbookId = currentCookbook?.id ?? 0;
    await invite(cookbookId)
    setIsSubmitted(false)
    setInviteEmail("")
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