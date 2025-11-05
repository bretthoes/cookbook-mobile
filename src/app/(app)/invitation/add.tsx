import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { useMemo, useState } from "react"
import { TextStyle, ViewStyle, Share, View, Pressable } from "react-native"
import * as Clipboard from "expo-clipboard"
import { Screen, Text, Button, TextField, UseCase } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { colors, spacing } from "src/theme"
import { useHeader } from "src/utils/useHeader"
import Config from "src/config"

const Invitations = observer(() => {
  const {
    cookbookStore: { selected },
    invitationStore: { invite, link },
  } = useStores()

  const [activeTab, setActiveTab] = useState<"link" | "email">("link")

  // Link tab state
  const [isMinting, setIsMinting] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [linkMsg, setLinkMsg] = useState("")

  // Email tab state
  const [inviteEmail, setInviteEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [emailMsg, setEmailMsg] = useState("")

  const toInviteUrl = (token: string) => new URL(`/i/${token}`, Config.INVITE_BASE_URL).toString()

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

  const switchTab = (tab: "link" | "email") => {
    setActiveTab(tab)
    if (tab === "link") setEmailMsg("")
    else setLinkMsg("")
  }

  const mintIfNeeded = async () => {
    if (inviteUrl) return inviteUrl
    if (isMinting) return null
    setIsMinting(true)
    try {
      const cookbookId = selected?.id ?? 0
      const res = await link(cookbookId)
      if (res?.message) {
        setLinkMsg(res?.message ?? "Failed to create link.")
        return null
      }
      const url = toInviteUrl(res.token)
      setInviteUrl(url)
      return url
    } finally {
      setIsMinting(false)
    }
  }

  const onCopyLink = async () => {
    const url = await mintIfNeeded()
    if (!url) return
    await Clipboard.setStringAsync(url)
    setLinkMsg("Invite link copied.")
  }

  const onShareLink = async () => {
    const url = await mintIfNeeded()
    if (!url) return
    await Share.share({ message: url })
    setLinkMsg("Invite link ready to share.")
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

      {/* Tabs */}
      <View style={$tabs}>
        <Pressable onPress={() => switchTab("link")} style={$tab}>
          <Text text="Link invite" style={[$tabLabel, activeTab === "link" && $tabActive]} />
        </Pressable>
        <Pressable onPress={() => switchTab("email")} style={$tab}>
          <Text text="Email invite" style={[$tabLabel, activeTab === "email" && $tabActive]} />
        </Pressable>
      </View>

      {activeTab === "link" ? (
        <UseCase>
          <Text
            text="Generate a one-time link and share or copy."
            preset="formHelper"
            style={{ marginBottom: spacing.sm }}
          />
          <View style={$row}>
            <View style={$flex}>
              <Button
                text={inviteUrl ? "Share Again" : isMinting ? "Generating…" : "Share Link"}
                onPress={onShareLink}
                disabled={isMinting}
              />
            </View>
            <View style={$spacer} />
            <View style={$flex}>
              <Button
                text={inviteUrl ? "Copy Again" : isMinting ? "Generating…" : "Copy Link"}
                onPress={onCopyLink}
                disabled={isMinting}
              />
            </View>
          </View>
          {!!linkMsg && (
            <Text text={linkMsg} preset="formHelper" style={{ paddingHorizontal: spacing.sm, marginTop: spacing.sm }} />
          )}
        </UseCase>
      ) : (
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
          <Button text="Send Email Invite" onPress={onSendEmail} style={{ marginTop: spacing.md }} />
          {!!emailMsg && (
            <Text text={emailMsg} preset="formHelper" style={{ paddingHorizontal: spacing.sm, marginTop: spacing.sm }} />
          )}
        </UseCase>
      )}
    </Screen>
  )
})

export default Invitations

const $root: ViewStyle = { flex: 1 }
const $tabs: ViewStyle = {
  flexDirection: "row",
  backgroundColor: colors.background,
  padding: spacing.xs,
  marginHorizontal: spacing.md,
  marginTop: spacing.md,
  borderColor: colors.border,
  borderWidth: spacing.xxxs
}
const $tab: ViewStyle = {
  flex: 1,
  paddingVertical: spacing.sm,
  alignItems: "center",
}
const $tabActive: TextStyle = {
  fontWeight: "bold",
  textDecorationLine: "underline",
}
const $tabLabel: TextStyle = {}
const $row: ViewStyle = { flexDirection: "row", alignItems: "stretch", marginTop: spacing.xs }
const $flex: ViewStyle = { flex: 1 }
const $spacer: ViewStyle = { width: spacing.sm }
