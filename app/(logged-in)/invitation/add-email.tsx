import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { UseCase } from "@/components/UseCase"
import { useStores } from "@/models/helpers/useStores"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { validateInviteEmail } from "@/utils/invitations"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useMemo, useState } from "react"
import { TextStyle, View, ViewStyle } from "react-native"

export default observer(function AddInvitationEmailScreen() {
  const {
    cookbookStore: { selected },
    invitationStore: { invite },
  } = useStores()
  const { themed } = useAppTheme()

  const [inviteEmail, setInviteEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [emailMsg, setEmailMsg] = useState("")

  const validationError = useMemo(
    () => (isSubmitted ? validateInviteEmail(inviteEmail) : ""),
    [isSubmitted, inviteEmail],
  )

  useHeader({
    title: "Invite by Email",
    leftIcon: "back",
    onLeftPress: () => router.back(),
  })

  const onSendEmail = async () => {
    setIsSubmitted(true)
    setEmailMsg("")
    const error = validateInviteEmail(inviteEmail)
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

  const $themedIntro = useMemo(() => themed($intro), [themed])
  const $themedSection = useMemo(() => themed($section), [themed])
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
          <TextField
            value={inviteEmail}
            onChangeText={(text) => {
              setInviteEmail(text.replace(/\s/g, ""))
              setEmailMsg("")
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
            style={$themedButton}
          />
          {!!emailMsg && (
            <Text text={emailMsg} preset="formHelper" style={$themedHelper} />
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

const $helper: ThemedStyle<TextStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.sm,
  marginTop: theme.spacing.sm,
})
