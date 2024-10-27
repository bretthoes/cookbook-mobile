import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Screen, Text, TextField } from "app/components"
import { useStores } from "app/models"
import { spacing } from "app/theme"
// import { useNavigation } from "@react-navigation/native"

interface CookbookInviteScreenProps extends AppStackScreenProps<"CookbookInvite"> {}

// TODO rename AddInviteScreen
export const CookbookInviteScreen: FC<CookbookInviteScreenProps> = observer(function CookbookInviteScreen() {
  // Pull in one of our MST stores
  const { 
    cookbookStore,
    invitationStore: { 
      invite, inviteEmail, setInviteEmail, validationError 
    }
  } = useStores()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const error = isSubmitted ? validationError : ""

  async function send() {
    setIsSubmitted(true)
    if (validationError) return

    // TODO make this a view in cookbook store
    const cookbookId = cookbookStore.currentCookbook?.id ?? 0;
    await invite(cookbookId)
    setIsSubmitted(false)
    setInviteEmail("")
    // TODO toast indicating success
    // OR 
  }

  return (
    <Screen style={$root} preset="auto" safeAreaEdges={["top"]}>
      <Text text={`Invite someone to ${cookbookStore.currentCookbook?.title}:`} preset="subheading" />
      <TextField
        value={inviteEmail}
        onChangeText={setInviteEmail}
        containerStyle={$textField}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        labelTx="loginScreen.emailFieldLabel"
        placeholderTx="loginScreen.emailFieldPlaceholder"
        helper={error}
        status={error ? "error" : undefined}
      />
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