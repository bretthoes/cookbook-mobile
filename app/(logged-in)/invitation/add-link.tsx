import { Button } from "@/components/Button"
import { GettingStartedGuide, useGuideAnchor } from "@/components/cookbooks/GettingStartedGuide"
import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { SectionCard } from "@/components/SectionCard"
import { translate } from "@/i18n"
import { useSelectedCookbook } from "@/hooks/useSelectedCookbook"
import { useAuthStore } from "@/stores/authStore"
import { createInvitationLink } from "@/hooks/queries/useInvitationsQuery"
import type { ThemedStyle } from "@/theme"
import { useThemedStyles } from "@/theme/useThemedStyles"
import { useAppTheme } from "@/theme/context"
import {
  advanceGettingStartedTour,
  completeGettingStartedTour,
  endGettingStartedTour,
  getGettingStartedTour,
  markGettingStartedStepDone,
  useGettingStartedTour,
} from "@/utils/gettingStartedTour"
import { inviteLinkPreview, toInviteUrl } from "@/utils/invitations"
import { useHeader } from "@/utils/useHeader"
import * as Clipboard from "expo-clipboard"
import { router } from "expo-router"
import { useFocusEffect } from "expo-router/react-navigation"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"
import { ActivityIndicator, Pressable, Share, TextStyle, View, ViewStyle } from "react-native"

export default function AddInvitationLinkScreen() {
  const { selected } = useSelectedCookbook()
  const userId = useAuthStore((s) => s.userId)
  const { theme } = useAppTheme()
  const tour = useGettingStartedTour()
  const showGuide = tour?.step === "invite" && tour.phase === "screen"
  const linkAnchor = useGuideAnchor(showGuide)

  const [isMinting, setIsMinting] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [linkMsg, setLinkMsg] = useState("")
  const [copied, setCopied] = useState(false)

  useFocusEffect(
    useCallback(() => {
      if (getGettingStartedTour()?.step === "invite") advanceGettingStartedTour("screen")
    }, []),
  )

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
    createInvitationLink(cookbookId)
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
  }, [selected?.id])

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
    }
  }, [])

  const onCopyLink = useCallback(async () => {
    if (!inviteUrl || isMinting) return
    await Clipboard.setStringAsync(inviteUrl)
    markGettingStartedStepDone(userId, "invite")
    setCopied(true)
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
    copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
  }, [inviteUrl, isMinting, userId])

  const onShareLink = useCallback(async () => {
    if (!inviteUrl || isMinting) return
    const shared = await Share.share({ message: inviteUrl })
    if (shared.action === Share.sharedAction) markGettingStartedStepDone(userId, "invite")
  }, [inviteUrl, isMinting, userId])

  const $themedIntro = useThemedStyles($intro)
  const $themedLinkHeader = useThemedStyles($linkHeader)
  const $themedLinkBox = useThemedStyles($linkBox)
  const $themedGeneratingRow = useThemedStyles($generatingRow)
  const $themedLinkText = useThemedStyles($linkText)
  const $themedPlaceholderText = useThemedStyles($placeholderText)
  const $themedShareButton = useThemedStyles($shareButton)
  const $themedHelper = useThemedStyles($helper)
  const $themedOr = useThemedStyles($or)
  const $themedEmailRow = useThemedStyles($emailRow)
  const $themedEmailDescription = useThemedStyles($emailDescription)

  return (
    <View style={$root}>
      <Screen preset="scroll">
        <Text
          tx="invitationAddLinkScreen:inviteIntro"
          txOptions={{
            cookbookName: selected?.title ?? translate("invitationAddLinkScreen:yourCookbook"),
          }}
          style={$themedIntro}
        />

        <GuideAnchor anchorRef={linkAnchor.ref} onAnchorLayout={linkAnchor.onLayout}>
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
                  <Text
                    tx="invitationAddLinkScreen:generatingLink"
                    style={$themedPlaceholderText}
                  />
                </View>
              ) : inviteUrl ? (
                <Text
                  numberOfLines={1}
                  text={inviteLinkPreview(inviteUrl)}
                  style={$themedLinkText}
                />
              ) : (
                <Text tx="invitationAddLinkScreen:linkPlaceholder" style={$themedPlaceholderText} />
              )}
            </View>

            <Button
              tx="invitationAddLinkScreen:shareButton"
              onPress={onShareLink}
              disabled={!inviteUrl || isMinting}
              preset="filled"
              style={$themedShareButton}
            />

            {copied && (
              <Text
                tx="invitationAddLinkScreen:linkCopied"
                preset="formHelper"
                style={$themedHelper}
              />
            )}
            {!!linkMsg && <Text text={linkMsg} preset="formHelper" style={$themedHelper} />}
          </SectionCard>
        </GuideAnchor>

        <Text tx="invitationAddLinkScreen:or" size="xs" style={$themedOr} />

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/(logged-in)/invitation/add-email")}
          style={$themedEmailRow}
        >
          <Text preset="subheading" tx="invitationAddLinkScreen:inviteByEmail" />
          <Text
            preset="formHelper"
            tx="invitationAddLinkScreen:inviteByEmailDesc"
            style={$themedEmailDescription}
          />
        </Pressable>
      </Screen>
      {showGuide ? (
        <GettingStartedGuide
          messageTx="gettingStarted:guideInviteOptions"
          primaryTx="gettingStarted:gotIt"
          target={linkAnchor.target}
          onPrimary={() => completeGettingStartedTour(userId)}
          onClose={endGettingStartedTour}
        />
      ) : null}
    </View>
  )
}

function GuideAnchor({
  anchorRef,
  onAnchorLayout,
  children,
}: {
  anchorRef: RefObject<View | null>
  onAnchorLayout: () => void
  children: ReactNode
}) {
  return (
    <View ref={anchorRef} onLayout={onAnchorLayout} collapsable={false}>
      {children}
    </View>
  )
}

const $root: ViewStyle = {
  flex: 1,
}

const $intro: ThemedStyle<TextStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.md,
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

const $shareButton: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.md,
})

const $helper: ThemedStyle<TextStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.sm,
  marginTop: theme.spacing.sm,
})

const $or: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  textAlign: "center",
  marginTop: theme.spacing.xs,
})

const $emailRow: ThemedStyle<ViewStyle> = (theme) => ({
  marginHorizontal: theme.spacing.md,
  paddingVertical: theme.spacing.md,
  paddingHorizontal: theme.spacing.sm,
})

const $emailDescription: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  marginTop: theme.spacing.xxs,
})
