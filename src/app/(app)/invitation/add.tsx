import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState, useMemo } from "react"
import { TextStyle, ViewStyle, View } from "react-native"
import { Screen, Text, Button, TextField, UseCase, Divider } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { colors, spacing } from "src/theme"
import { useHeader } from "src/utils/useHeader"

export default observer(function Invitations() {
  const { 
    cookbookStore: { selected },
    invitationStore: { 
      invite,
    }
  } = useStores()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [result, setResult] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  
  const getValidationError = (email: string) => {
    if (email.length === 0) return "can't be blank"
    if (email.length < 6) return "must be at least 6 characters"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "must be a valid email address"
    return ""
  }
  
  const validationError = useMemo(() => 
    isSubmitted ? getValidationError(inviteEmail) : ""
  , [isSubmitted, inviteEmail])

  useHeader({
    title: "Invite a Friend",
    leftIcon: "back",
    onLeftPress: () => router.back(),
  })

  // Reset email when component mounts
  useEffect(() => {
    setInviteEmail("")
  }, [])

  async function send() {
    setIsSubmitted(true)
    
    // Directly check for validation errors
    const error = getValidationError(inviteEmail)
    if (error) {
      return
    }
    
    const cookbookId = selected?.id ?? 0;
    setResult(await invite(cookbookId, inviteEmail))
    setIsSubmitted(false)
    setInviteEmail("")
  }

  return (
    <Screen style={$root} preset="scroll">
      <Text text={`Invite a friend to join ${selected?.title ?? "your cookbook"}.`}
        style={{ paddingHorizontal: spacing.md }}
      />
      <UseCase>
        <Text text="Your friend needs to have an account to receive an invitation!" style={$hint} />
        <Divider />
        <TextField
          value={inviteEmail}
          onChangeText={(text) => {
            const cleanText = text.replace(/\s/g, "")
            setInviteEmail(cleanText)
          }}
          autoCapitalize="none"
          label="Email Address"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="Enter an email address"
          helper={validationError}
          status={validationError ? "error" : undefined}
        />
        <Text text={`${result}`} preset="formHelper" />
        <Button
          text="Send Invitation"
          onPress={send}
          style={{ marginTop: spacing.md }}
        />
      </UseCase>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $hint: TextStyle = {
  color: colors.tint,
}

