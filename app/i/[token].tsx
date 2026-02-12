import { Button } from "@/components/Button"
import { EmptyState } from "@/components/EmptyState"
import { Header } from "@/components/Header"
import { LoadingScreen } from "@/components/LoadingScreen"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { isRTL } from "@/i18n"
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
        setError("Invalid invitation link")
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
          setError("Your invitation has mysteriously vanished")
        }
      } catch (err) {
        setError("Your invitation has mysteriously vanished")
        console.error("Error loading invitation:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadInvitation()
  }, [token, isAuthenticated, invitationStore])

  const handleAccept = async () => {
    if (!isAuthenticated) {
      Alert.alert("Login Required", "Please log in to accept this invitation.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log In",
          onPress: () => router.push("/log-in"),
        },
      ])
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

    if (success) {
      Alert.alert("Success", "You've been added to the cookbook!", [
        {
          text: "OK",
          onPress: () => router.replace("../../(tabs)/cookbooks"),
        },
      ])
    } else {
      setActionError("Failed to accept invitation. Please try again.")
    }
  }

  const handleReject = async () => {
    if (!token) return

    Alert.alert("Decline Invitation", "Are you sure you want to decline this invitation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Decline",
        style: "destructive",
        onPress: async () => {
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
          if (success) {
            router.back()
          } else {
            setActionError("Failed to decline invitation. Please try again.")
          }
        },
      },
    ])
  }

  if (processingAction) {
    return <LoadingScreen text={"Not much longer"} />
  }

  if (isLoading) {
    return (
      <Screen style={$root} preset="scroll">
        <Header title="Invite link" leftIcon="back" onLeftPress={() => router.back()} />
        <ActivityIndicator size="large" style={{ marginTop: spacing.xxl }} />
        <Text
          text="Loading invitation..."
          style={{ marginTop: spacing.md, textAlign: "center", paddingHorizontal: spacing.md }}
        />
      </Screen>
    )
  }

  if (error) {
    return (
      <Screen style={$root} preset="scroll">
        <Header title="Invite link" leftIcon="back" onLeftPress={() => router.back()} />
        <View style={$centeredContent}>
          <EmptyState
            preset="generic"
            style={$themedEmptyState}
            content="We couldn't find your invitation anywhere. You might need a new one."
            imageStyle={$themedEmptyStateImage}
            ImageProps={{ resizeMode: "contain" }}
            button=""
          />
          <Button
            text="Go Back"
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
        <Header title="Invite link" leftIcon="back" onLeftPress={() => router.back()} />
        <Text
          text="Invitation Link"
          preset="heading"
          style={{ marginTop: spacing.xxl, textAlign: "center", paddingHorizontal: spacing.md }}
        />
        <Text
          text="Please log in to view and accept this invitation."
          style={{ marginTop: spacing.md, paddingHorizontal: spacing.md, textAlign: "center" }}
        />
        <Button
          text="Log In"
          onPress={() => router.push("/log-in")}
          style={{ marginTop: spacing.xl, marginHorizontal: spacing.md }}
        />
        <Button
          text="Go Back"
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
        <Header title="Invite link" leftIcon="back" onLeftPress={() => router.back()} />
        <ActivityIndicator size="large" style={{ marginTop: spacing.xxl }} />
        <Text
          text="Loading invitation..."
          style={{ marginTop: spacing.md, textAlign: "center", paddingHorizontal: spacing.md }}
        />
      </Screen>
    )
  }

  return (
    <Screen style={$root} preset="scroll">
      <Header title="Invite link" leftIcon="back" onLeftPress={() => router.back()} />
      <Text
        text="You've been invited!"
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
          text="Please log in to accept this invitation."
          preset="formHelper"
          style={{ marginTop: spacing.md, paddingHorizontal: spacing.md, textAlign: "center" }}
        />
      )}

      <Button
        text={isAuthenticated ? "Accept Invitation" : "Log In to Accept"}
        onPress={handleAccept}
        style={{ marginTop: spacing.xl, marginHorizontal: spacing.md }}
      />

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

      {isAuthenticated && (
        <Button
          text="Decline"
          onPress={handleReject}
          style={{ marginTop: spacing.md, marginHorizontal: spacing.md }}
          preset="reversed"
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
