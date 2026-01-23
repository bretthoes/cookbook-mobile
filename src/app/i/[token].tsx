import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, ActivityIndicator, Alert } from "react-native"
import { Screen, Text, Button } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { spacing } from "src/theme"
import { router, useLocalSearchParams } from "expo-router"
import { useHeader } from "src/utils/useHeader"

export default observer(function InvitationTokenScreen() {
  const { token } = useLocalSearchParams<{ token: string }>()
  const {
    invitationStore,
    authenticationStore: { isAuthenticated },
  } = useStores()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<any>(null)

  useHeader({
    title: "Invitation",
    leftIcon: "back",
    onLeftPress: () => router.back(),
  })

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
          setError("Invitation not found or has expired")
        }
      } catch (err) {
        setError("Failed to load invitation. Please try again.")
        console.error("Error loading invitation:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadInvitation()
  }, [token, isAuthenticated])

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

    if (!invitation) return

    setIsLoading(true)
    const success = await invitationStore.respond(invitation.id, true)
    setIsLoading(false)

    if (success) {
      Alert.alert("Success", "You've been added to the cookbook!", [
        {
          text: "OK",
          onPress: () => router.replace("/(app)/(tabs)/cookbooks"),
        },
      ])
    } else {
      Alert.alert("Error", "Failed to accept invitation. Please try again.")
    }
  }

  const handleReject = async () => {
    if (!invitation) return

    Alert.alert("Decline Invitation", "Are you sure you want to decline this invitation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Decline",
        style: "destructive",
        onPress: async () => {
          setIsLoading(true)
          await invitationStore.respond(invitation.id, false)
          setIsLoading(false)
          router.back()
        },
      },
    ])
  }

  if (isLoading) {
    return (
      <Screen style={$root} preset="fixed">
        <ActivityIndicator size="large" style={{ marginTop: spacing.xxl }} />
        <Text text="Loading invitation..." style={{ marginTop: spacing.md, textAlign: "center" }} />
      </Screen>
    )
  }

  if (error) {
    return (
      <Screen style={$root} preset="fixed">
        <Text
          text={error}
          preset="heading"
          style={{ marginTop: spacing.xxl, textAlign: "center" }}
        />
        <Button text="Go Back" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </Screen>
    )
  }

  if (!invitation && !isAuthenticated) {
    return (
      <Screen style={$root} preset="fixed">
        <Text
          text="Invitation Link"
          preset="heading"
          style={{ marginTop: spacing.xxl, textAlign: "center" }}
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
      <Screen style={$root} preset="fixed">
        <ActivityIndicator size="large" style={{ marginTop: spacing.xxl }} />
        <Text text="Loading invitation..." style={{ marginTop: spacing.md, textAlign: "center" }} />
      </Screen>
    )
  }

  return (
    <Screen style={$root} preset="scroll">
      <Text
        text="You've been invited!"
        preset="heading"
        style={{ marginTop: spacing.lg, textAlign: "center" }}
      />
      <Text
        text={`You've been invited to join "${invitation.cookbookTitle || "a cookbook"}"`}
        style={{ marginTop: spacing.md, paddingHorizontal: spacing.md, textAlign: "center" }}
      />

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
  paddingHorizontal: spacing.md,
}
