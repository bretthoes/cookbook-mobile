import { Button } from "@/components/Button"
import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { SectionCard } from "@/components/SectionCard"
import { translate } from "@/i18n"
import { useSelectedCookbook } from "@/hooks/useSelectedCookbook"
import { useInvitationStore } from "@/stores/invitationStore"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { toInviteUrl } from "@/utils/invitations"
import { useHeader } from "@/utils/useHeader"
import * as Clipboard from "expo-clipboard"
import { router } from "expo-router"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ActivityIndicator, Share, TextStyle, View, ViewStyle } from "react-native"

export default function AddInvitationLinkScreen() {
  const { selected } = useSelectedCookbook()
  const link = useInvitationStore((s) => s.link)
  const { themed, theme } = useAppTheme()

  const [isMinting, setIsMinting] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [linkMsg, setLinkMsg] = useState("")
  const [copied, setCopied] = useState(false)

  useHeader({
    titleTx: "invitationAddLinkScreen:title",
    leftIcon: "back",
    onLeftPress: () => router.back(),
  })

  const hasGeneratedForCookbook = useRef<string | null>(null)
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const cookbookId = selected?.id ?? ""
    if (!cookbookId || hasGeneratedForCookbook.current === cookbookId) return
    hasGeneratedForCookbook.current = cookbookId

    let cancelled = false
    setInviteUrl(null)
    setLinkMsg("")
    setIsMinting(true)
    link(cookbookId)
      .then((res) => {
        if (cancelled) return
        if ("message" in res) {
          setLinkMsg(res.message ?? translate("invitationAddLinkScreen:failedToCreateLink"))
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
  }, [selected?.id, link])

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
    }
  }, [])

  const onCopyLink = useCallback(async () => {
    if (!inviteUrl || isMinting) return
    await Clipboard.setStringAsync(inviteUrl)
    setCopied(true)
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
    copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
  }, [inviteUrl, isMinting])

  const onShareLink = async () => {
    const cookbookId = selected?.id ?? ""
    if (!cookbookId || isMinting) return
    setIsMinting(true)
    setLinkMsg("")
    try {
      const res = await link(cookbookId)
      if ("message" in res) {
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

  const $themedIntro = useMemo(() => themed($intro), [themed])
  const $themedSection = useMemo(() => themed($section), [themed])
  const $themedLinkHeader = useMemo(() => themed($linkHeader), [themed])
  const $themedLinkBox = useMemo(() => themed($linkBox), [themed])
  const $themedGeneratingRow = useMemo(() => themed($generatingRow), [themed])
  const $themedLinkText = useMemo(() => themed($linkText), [themed])
  const $themedPlaceholderText = useMemo(() => themed($placeholderText), [themed])
  const $themedActions = useMemo(() => themed($actions), [themed])
  const $themedActionButton = useMemo(() => themed($actionButton), [themed])
  const $themedHelper = useMemo(() => themed($helper), [themed])

  return (
    <Screen preset="scroll">
      <Text
        tx="invitationAddLinkScreen:inviteIntro"
        txOptions={{
          cookbookName: selected?.title ?? translate("invitationAddLinkScreen:yourCookbook"),
        }}
        style={$themedIntro}
      />

      <View style={$themedSection}>
        <SectionCard>
          <View style={$themedLinkHeader}>
            <Text tx="invitationAddLinkScreen:inviteLinkLabel" preset="formLabel" />
            {!!inviteUrl && !isMinting && (
              <PressableIcon
                icon="copy"
                size={22}
                color={theme.colors.tint}
                onPress={onCopyLink}
                accessibilityRole="button"
                accessibilityLabel={translate("invitationAddLinkScreen:copyButton")}
              />
            )}
          </View>

          <View style={$themedLinkBox}>
            {isMinting ? (
              <View style={$themedGeneratingRow}>
                <ActivityIndicator color={theme.colors.tint} />
                <Text tx="invitationAddLinkScreen:generatingLink" style={$themedPlaceholderText} />
              </View>
            ) : inviteUrl ? (
              <Text selectable text={inviteUrl} style={$themedLinkText} />
            ) : (
              <Text tx="invitationAddLinkScreen:linkPlaceholder" style={$themedPlaceholderText} />
            )}
          </View>

          <View style={$themedActions}>
            <Button
              tx="invitationAddLinkScreen:copyButton"
              onPress={onCopyLink}
              disabled={!inviteUrl || isMinting}
              style={$themedActionButton}
            />
            <Button
              tx="invitationAddLinkScreen:shareButton"
              onPress={onShareLink}
              disabled={!selected?.id || isMinting}
              preset="filled"
              style={$themedActionButton}
            />
          </View>

          {copied && (
            <Text
              tx="invitationAddLinkScreen:linkCopied"
              preset="formHelper"
              style={$themedHelper}
            />
          )}
          {!!linkMsg && <Text text={linkMsg} preset="formHelper" style={$themedHelper} />}
        </SectionCard>
      </View>
    </Screen>
  )
}

const $intro: ThemedStyle<TextStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.md,
})

const $section: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.md,
})

const $linkHeader: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing.sm,
})

const $linkBox: ThemedStyle<ViewStyle> = (theme) => ({
  borderWidth: 1,
  borderColor: theme.colors.separator,
  borderRadius: 8,
  backgroundColor: theme.colors.background,
  padding: theme.spacing.md,
  minHeight: 56,
  justifyContent: "center",
})

const $generatingRow: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing.sm,
})

const $linkText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.tint,
  fontSize: 15,
  lineHeight: 22,
})

const $placeholderText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
})

const $actions: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  gap: theme.spacing.sm,
  marginTop: theme.spacing.md,
})

const $actionButton: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $helper: ThemedStyle<TextStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.sm,
  marginTop: theme.spacing.sm,
})
