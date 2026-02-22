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
import React, { useEffect, useMemo, useRef, useState } from "react"
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

  const hasGeneratedForCookbook = useRef<number | null>(null)

  // Generate invite link once on mount when cookbook is available
  useEffect(() => {
    const cookbookId = selected?.id ?? 0
    if (!cookbookId || hasGeneratedForCookbook.current === cookbookId) return
    hasGeneratedForCookbook.current = cookbookId

    let cancelled = false
    setInviteUrl(null)
    setLinkMsg("")
    setIsMinting(true)
    link(cookbookId)
      .then((res) => {
        if (cancelled) return
        if (res?.message) {
          setLinkMsg(res.message ?? "Failed to create link.")
        } else {
          setInviteUrl(toInviteUrl(res.token))
        }
      })
      .finally(() => {
        if (!cancelled) setIsMinting(false)
      })
    return () => {
      cancelled = true
    }
  }, [selected?.id])

  const onShareLink = async () => {
    const cookbookId = selected?.id ?? 0
    if (!cookbookId || isMinting) return
    setIsMinting(true)
    setLinkMsg("")
    try {
      const res = await link(cookbookId)
      if (res?.message) {
        setLinkMsg(res.message)
        return
      }
      const url = toInviteUrl(res.token)
      setInviteUrl(url)
      await Share.share({ message: url })
    } finally {
      setIsMinting(false)
    }
  }

  const onInviteByEmailPress = () => {
    setShowEmailForm(true)
  }

  const onSendEmail = async () => {
    setIsSubmitted(true)
    setEmailMsg("") // Clear previous message
    const error = getValidationError(inviteEmail)
    if (error) {
      setIsSubmitted(false)
      return
    }

    const cookbookId = selected?.id ?? 0
    const res = await invite(cookbookId, inviteEmail.trim())
    setIsSubmitted(false)

    setEmailMsg(res)
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
            disabled={!selected?.id || isMinting}
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
              onChangeText={(text) => {
                setInviteEmail(text.replace(/\s/g, ""))
                setEmailMsg("") // Clear message when user types
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
