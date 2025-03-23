import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { TextStyle, ViewStyle, View } from "react-native"
import { Screen, Text, Button, TextField, UseCase, Divider } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { spacing } from "src/theme"
import { useHeader } from "src/utils/useHeader"

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

  useHeader({
    title: "Invite a Friend",
    leftIcon: "back",
    onLeftPress: () => router.back(),
    rightText: "Send",
    onRightPress: () => send(),
  })

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
    <Screen style={$root} preset="scroll">
      <Text text={`Invite a friend to join "${currentCookbook?.title}". Your friend needs to have an account to join you.`}
        style={{ paddingHorizontal: spacing.md }}
      />
      <UseCase>
        <Divider />
        <TextField
          value={inviteEmail}
          onChangeText={setInviteEmail}
          autoCapitalize="none"
          label="Email Address"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="Enter an email address"
          helper={error}
          status={error ? "error" : undefined}
        />
        <Text text={`${result}`} preset="formHelper" />
      </UseCase>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
