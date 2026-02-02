import { Button } from "@/components/Button"
import { Divider } from "@/components/Divider"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { UseCase } from "@/components/UseCase"
import { useStores } from "@/models/helpers/useStores"
import { spacing } from "@/theme"
import { useHeader } from "@/utils/useHeader"
import * as Linking from "expo-linking"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { Share, View, ViewStyle } from "react-native"

const Invitations = observer(() => {
  const {
    cookbookStore: { selected },
    invitationStore: { invite, link },
  } = useStores()

  // Link state
  const [isMinting, setIsMinting] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [linkMsg, setLinkMsg] = useState("")

  // Email state
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [emailMsg, setEmailMsg] = useState("")

  const toInviteUrl = (token: string) => {
    return Linking.createURL(`/i/${token}`)
  }

  const getValidationError = (email: string) => {
    if (email.length === 0) return "can't be blank"
    if (email.length < 6) return "must be at least 6 characters"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "must be a valid email address"
    return ""
  }

  const validationError = useMemo(
    () => (isSubmitted ? getValidationError(inviteEmail) : ""),
    [isSubmitted, inviteEmail],
  )

  useHeader({
    title: "Invite Friends",
    leftIcon: "back",
    onLeftPress: () => router.back(),
  })

  // Generate invite link on mount
  useEffect(() => {
    const generateLink = async () => {
      if (inviteUrl || isMinting) return
      setIsMinting(true)
      try {
        const cookbookId = selected?.id ?? 0
        const res = await link(cookbookId)
        if (res?.message) {
          setLinkMsg(res?.message ?? "Failed to create link.")
          return
        }
        const url = toInviteUrl(res.token)
        setInviteUrl(url)
      } finally {
        setIsMinting(false)
      }
    }
    generateLink()
  }, [selected?.id, inviteUrl, isMinting, link])

  const onShareLink = async () => {
    if (!inviteUrl) return
    await Share.share({ message: inviteUrl })
  }

  const onInviteByEmailPress = () => {
    setShowEmailForm(true)
  }

  const onSendEmail = async () => {
    setIsSubmitted(true)
    const error = getValidationError(inviteEmail)
    if (error) return

    const cookbookId = selected?.id ?? 0
    const res = await invite(cookbookId, inviteEmail.trim())
    setIsSubmitted(false)

    if (!res?.ok) {
      setEmailMsg(res?.msg ?? "Failed to send invitation.")
      return
    }

    const url = toInviteUrl(res.token)
    setEmailMsg(`Invitation sent. Link: ${url}`)
    setInviteEmail("")
  }

  return (
    <Screen style={$root} preset="scroll">
      <Text
        text={`Invite friends to join ${selected?.title ?? "your cookbook"}.`}
        style={{ paddingHorizontal: spacing.md }}
      />

      {/* Invite link section */}
      <View style={{ marginTop: spacing.md }}>
        <UseCase>
          <Text text="Invite link" preset="formLabel" style={{ marginBottom: spacing.sm }} />
          <TextField
            value={isMinting ? "Generating link..." : inviteUrl || ""}
            editable={false}
            placeholder="Link will be generated..."
          />
          <Button
            text="Share"
            onPress={onShareLink}
            disabled={!inviteUrl || isMinting}
            style={{ marginTop: spacing.md }}
          />
          {!!linkMsg && (
            <Text
              text={linkMsg}
              preset="formHelper"
              style={{ paddingHorizontal: spacing.sm, marginTop: spacing.sm }}
            />
          )}
        </UseCase>
      </View>

      {/* Separator */}
      <Divider size={spacing.lg} line />

      {/* Invite by email button */}
      <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.md }}>
        <Button text="Invite by email" onPress={onInviteByEmailPress} />
      </View>

      {/* Email form */}
      {showEmailForm && (
        <View style={{ marginTop: spacing.md }}>
          <UseCase>
            <TextField
              value={inviteEmail}
              onChangeText={(text) => setInviteEmail(text.replace(/\s/g, ""))}
              autoCapitalize="none"
              label="Email Address"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="Enter an email address"
              helper={validationError}
              status={validationError ? "error" : undefined}
            />
            <Button
              text="Send Email Invite"
              onPress={onSendEmail}
              style={{ marginTop: spacing.md }}
            />
            {!!emailMsg && (
              <Text
                text={emailMsg}
                preset="formHelper"
                style={{ paddingHorizontal: spacing.sm, marginTop: spacing.sm }}
              />
            )}
          </UseCase>
        </View>
      )}
    </Screen>
  )
})

export default Invitations

const $root: ViewStyle = { flex: 1 }
