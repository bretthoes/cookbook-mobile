import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { UseCase } from "@/components/UseCase"
import { useStores } from "@/models/helpers/useStores"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { toInviteUrl } from "@/utils/invitations"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useEffect, useMemo, useRef, useState } from "react"
import { Share, TextStyle, View, ViewStyle } from "react-native"

export default observer(function AddInvitationLinkScreen() {
  const {
    cookbookStore: { selected },
    invitationStore: { link },
  } = useStores()
  const { themed } = useAppTheme()

  const [isMinting, setIsMinting] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [linkMsg, setLinkMsg] = useState("")

  useHeader({
    title: "Invite by Link",
    leftIcon: "back",
    onLeftPress: () => router.back(),
  })

  const hasGeneratedForCookbook = useRef<number | null>(null)

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
  }, [selected?.id, link])

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

  const $themedIntro = useMemo(() => themed($intro), [themed])
  const $themedSection = useMemo(() => themed($section), [themed])
  const $themedFormLabel = useMemo(() => themed($formLabel), [themed])
  const $themedHelper = useMemo(() => themed($helper), [themed])
  const $themedButton = useMemo(() => themed($buttonSpacer), [themed])

  return (
    <Screen preset="scroll">
      <Text
        text={`Invite friends to join ${selected?.title ?? "your cookbook"}.`}
        style={$themedIntro}
      />

      <View style={$themedSection}>
        <UseCase>
          <Text text="Invite link" preset="formLabel" style={$themedFormLabel} />
          <TextField
            value={isMinting ? "Generating link..." : inviteUrl || ""}
            editable={false}
            placeholder="Link will be generated..."
          />
          <Button
            text="Share"
            onPress={onShareLink}
            disabled={!selected?.id || isMinting}
            style={$themedButton}
          />
          {!!linkMsg && (
            <Text text={linkMsg} preset="formHelper" style={$themedHelper} />
          )}
        </UseCase>
      </View>
    </Screen>
  )
})

const $intro: ThemedStyle<TextStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.md,
})

const $section: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.md,
})

const $buttonSpacer: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.md,
})

const $formLabel: ThemedStyle<TextStyle> = (theme) => ({
  marginBottom: theme.spacing.sm,
})

const $helper: ThemedStyle<TextStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.sm,
  marginTop: theme.spacing.sm,
})
