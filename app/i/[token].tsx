import { Button } from "@/components/Button"
import { EmptyState } from "@/components/EmptyState"
import { Header } from "@/components/Header"
import { LoadingScreen } from "@/components/LoadingScreen"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { isRTL, translate } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { getCookbookImage } from "@/utils/cookbookImages"
import { router, useLocalSearchParams } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageStyle,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

export default observer(function InvitationTokenScreen() {
  const { token } = useLocalSearchParams<{ token: string }>()
  const {
    invitationStore,
    authenticationStore: { isAuthenticated },
  } = useStores()
  const { themed, theme } = useAppTheme()

  const [isLoading, setIsLoading] = useState(true)
  const [processingAction, setProcessingAction] = useState<"accept" | "decline" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<any>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [acceptedSuccessfully, setAcceptedSuccessfully] = useState(false)
  const [declinedSuccessfully, setDeclinedSuccessfully] = useState(false)

  const $themedEmptyState = useMemo(() => themed($emptyState), [themed])
  const $themedEmptyStateImage = useMemo(() => themed($emptyStateImage), [themed])
  const $themedCookbookImage = useMemo(() => themed($cookbookImage), [themed])
  const $themedCookbookTitle = useMemo(() => themed($cookbookTitle), [themed])

  const cookbookImageSource = useMemo(() => {
    if (invitation?.cookbookImage) {
      return { uri: invitation.cookbookImage }
    }
    if (invitation?.cookbookId) {
      return getCookbookImage(invitation.cookbookId)
    }
    return null
  }, [invitation?.cookbookImage, invitation?.cookbookId])

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        setError(translate("invitationLinkScreen:invalidLink"))
        setIsLoading(false)
        return
      }

      // If not authenticated, we can't load the invitation yet
      // The user will need to log in first
      if (!isAuthenticated) {
        setIsLoading(false)
        setError(null) // Don't show error, just prompt for login
        return
      }

      try {
        await invitationStore.single(token)
        if (invitationStore.invitation) {
          setInvitation(invitationStore.invitation)
        } else {
          setError(translate("invitationLinkScreen:vanished"))
        }
      } catch (err) {
        setError(translate("invitationLinkScreen:vanished"))
        console.error("Error loading invitation:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadInvitation()
  }, [token, isAuthenticated, invitationStore])

  const handleAccept = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        translate("invitationLinkScreen:loginRequiredTitle"),
        translate("invitationLinkScreen:loginRequiredMessage"),
        [
          { text: translate("common:cancel"), style: "cancel" },
          {
            text: translate("invitationLinkScreen:loginButton"),
            onPress: () => router.push("/log-in"),
          },
        ],
      )
      return
    }

    if (!token) return

    setActionError(null)
    setProcessingAction("accept")
    const startTime = Date.now()
    const success = await invitationStore.respond(token, true)
    const elapsedTime = Date.now() - startTime
    const minDelay = 1000 // 1 second minimum
    if (elapsedTime < minDelay) {
      await new Promise((resolve) => setTimeout(resolve, minDelay - elapsedTime))
    }
    setProcessingAction(null)

    if (success === true) {
      setAcceptedSuccessfully(true)
    } else {
      setActionError(
        success?.conflict
          ? translate("invitationLinkScreen:alreadyRedeemed")
          : translate("invitationLinkScreen:acceptFailed"),
      )
    }
  }

  const handleReject = async () => {
    if (!token) return

    setActionError(null)
    setProcessingAction("decline")
    const startTime = Date.now()
    const success = await invitationStore.respond(token, false)
    const elapsedTime = Date.now() - startTime
    const minDelay = 1000 // 1 second minimum
    if (elapsedTime < minDelay) {
      await new Promise((resolve) => setTimeout(resolve, minDelay - elapsedTime))
    }
    setProcessingAction(null)
    if (success === true) {
      setDeclinedSuccessfully(true)
    } else {
      setActionError(
        success?.conflict
          ? translate("invitationLinkScreen:alreadyRedeemed")
          : translate("invitationLinkScreen:declineFailed"),
      )
    }
  }

  if (processingAction) {
    return <LoadingScreen text={translate("invitationLinkScreen:loadingShort")} />
  }

  if (acceptedSuccessfully && invitation) {
    return (
      <Screen style={$root} preset="scroll">
        <Header
          titleTx="invitationLinkScreen:title"
          leftIcon="back"
          onLeftPress={() => router.replace("../../(tabs)/cookbooks")}
        />
        <Text
          tx="invitationLinkScreen:successHeading"
          preset="heading"
          style={{ marginTop: spacing.lg, textAlign: "center", paddingHorizontal: spacing.md }}
        />
        <Text
          tx="invitationLinkScreen:successMessage"
          style={{ marginTop: spacing.sm, textAlign: "center", paddingHorizontal: spacing.md }}
        />
        <View style={$cookbookContainer}>
          {cookbookImageSource && (
            <Image source={cookbookImageSource} style={$themedCookbookImage} resizeMode="cover" />
          )}
          {invitation.cookbookTitle && (
            <Text text={invitation.cookbookTitle} preset="subheading" style={$themedCookbookTitle} />
          )}
        </View>
        <Button
          tx="invitationLinkScreen:backToCookbooks"
          onPress={() => router.replace("../../(tabs)/cookbooks")}
          style={{ marginTop: spacing.xl, marginHorizontal: spacing.md }}
        />
      </Screen>
    )
  }

  if (declinedSuccessfully && invitation) {
    return (
      <Screen style={$root} preset="scroll">
        <Header
          titleTx="invitationLinkScreen:title"
          leftIcon="back"
          onLeftPress={() => router.replace("../../(tabs)/cookbooks")}
        />
        <Text
          tx="invitationLinkScreen:declinedHeading"
          preset="heading"
          style={{ marginTop: spacing.lg, textAlign: "center", paddingHorizontal: spacing.md }}
        />
        <Text
          tx="invitationLinkScreen:declinedMessage"
          style={{ marginTop: spacing.sm, textAlign: "center", paddingHorizontal: spacing.md }}
        />
        <View style={$cookbookContainer}>
          {cookbookImageSource && (
            <Image source={cookbookImageSource} style={$themedCookbookImage} resizeMode="cover" />
          )}
          {invitation.cookbookTitle && (
            <Text text={invitation.cookbookTitle} preset="subheading" style={$themedCookbookTitle} />
          )}
        </View>
        <Button
          tx="invitationLinkScreen:backToCookbooks"
          onPress={() => router.replace("../../(tabs)/cookbooks")}
          style={{ marginTop: spacing.xl, marginHorizontal: spacing.md }}
        />
      </Screen>
    )
  }

  if (isLoading) {
    return (
      <Screen style={$root} preset="scroll">
        <Header titleTx="invitationLinkScreen:title" leftIcon="back" onLeftPress={() => router.back()} />
        <ActivityIndicator size="large" style={{ marginTop: spacing.xxl }} />
        <Text
          tx="invitationLinkScreen:loading"
          style={{ marginTop: spacing.md, textAlign: "center", paddingHorizontal: spacing.md }}
        />
      </Screen>
    )
  }

  if (error) {
    return (
      <Screen style={$root} preset="scroll">
        <Header titleTx="invitationLinkScreen:title" leftIcon="back" onLeftPress={() => router.back()} />
        <View style={$centeredContent}>
          <EmptyState
            preset="generic"
            style={$themedEmptyState}
            contentTx="invitationLinkScreen:notFoundContent"
            imageStyle={$themedEmptyStateImage}
            ImageProps={{ resizeMode: "contain" }}
            button=""
          />
          <Button
            tx="invitationLinkScreen:goBack"
            onPress={() => router.back()}
            style={{ marginTop: spacing.lg, marginHorizontal: spacing.md }}
          />
        </View>
      </Screen>
    )
  }

  if (!invitation && !isAuthenticated) {
    return (
      <Screen style={$root} preset="scroll">
        <Header titleTx="invitationLinkScreen:title" leftIcon="back" onLeftPress={() => router.back()} />
        <Text
          tx="invitationLinkScreen:heading"
          preset="heading"
          style={{ marginTop: spacing.xxl, textAlign: "center", paddingHorizontal: spacing.md }}
        />
        <Text
          tx="invitationLinkScreen:loginToView"
          style={{ marginTop: spacing.md, paddingHorizontal: spacing.md, textAlign: "center" }}
        />
        <Button
          tx="invitationLinkScreen:loginButton"
          onPress={() => router.push("/log-in")}
          style={{ marginTop: spacing.xl, marginHorizontal: spacing.md }}
        />
        <Button
          tx="invitationLinkScreen:goBack"
          onPress={() => router.back()}
          style={{ marginTop: spacing.md, marginHorizontal: spacing.md }}
          preset="reversed"
        />
      </Screen>
    )
  }

  if (!invitation) {
    return (
      <Screen style={$root} preset="scroll">
        <Header titleTx="invitationLinkScreen:title" leftIcon="back" onLeftPress={() => router.back()} />
        <ActivityIndicator size="large" style={{ marginTop: spacing.xxl }} />
        <Text
          tx="invitationLinkScreen:loading"
          style={{ marginTop: spacing.md, textAlign: "center", paddingHorizontal: spacing.md }}
        />
      </Screen>
    )
  }

  return (
    <Screen style={$root} preset="scroll">
      <Header titleTx="invitationLinkScreen:title" leftIcon="back" onLeftPress={() => router.back()} />
      <Text
        tx="invitationLinkScreen:invitedHeading"
        preset="heading"
        style={{ marginTop: spacing.lg, textAlign: "center", paddingHorizontal: spacing.md }}
      />

      <View style={$cookbookContainer}>
        {cookbookImageSource && (
          <Image source={cookbookImageSource} style={$themedCookbookImage} resizeMode="cover" />
        )}
        {invitation.cookbookTitle && (
          <Text text={invitation.cookbookTitle} preset="subheading" style={$themedCookbookTitle} />
        )}
      </View>

      {!isAuthenticated && (
        <Text
          tx="invitationLinkScreen:loginToAccept"
          preset="formHelper"
          style={{ marginTop: spacing.md, paddingHorizontal: spacing.md, textAlign: "center" }}
        />
      )}

      <Button
        tx={isAuthenticated ? "invitationLinkScreen:acceptButton" : "invitationLinkScreen:loginToAcceptButton"}
        onPress={handleAccept}
        style={{ marginTop: spacing.xl, marginHorizontal: spacing.md }}
      />

      {isAuthenticated && (
        <Button
          tx="invitationLinkScreen:declineButton"
          onPress={handleReject}
          style={{ marginTop: spacing.md, marginHorizontal: spacing.md }}
          preset="reversed"
        />
      )}

      {actionError && (
        <Text
          text={actionError}
          style={{
            color: theme.colors.error,
            marginTop: spacing.md,
            textAlign: "center",
            paddingHorizontal: spacing.md,
          }}
        />
      )}
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $centeredContent: ViewStyle = {
  flex: 1,
  justifyContent: "center",
}

const $emptyState: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.md,
  marginTop: theme.spacing.xxxl,
})

const $emptyStateImage: ThemedStyle<ImageStyle> = () => ({
  transform: [{ scaleX: isRTL ? -1 : 1 }],
})

const $cookbookContainer: ViewStyle = {
  alignItems: "center",
  marginTop: spacing.lg,
  paddingHorizontal: spacing.md,
}

const $cookbookImage: ThemedStyle<ImageStyle> = (theme) => ({
  width: 120,
  height: 120,
  borderRadius: spacing.sm,
  marginBottom: spacing.md,
})

const $cookbookTitle: ThemedStyle<TextStyle> = () => ({
  textAlign: "center",
})
