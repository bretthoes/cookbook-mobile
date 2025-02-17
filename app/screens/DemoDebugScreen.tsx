import React, { FC, useEffect, useMemo, useState } from "react"
import * as Application from "expo-application"
import { Linking, Platform, TextStyle, View, ViewStyle } from "react-native"
import { Button, ListItem, Screen, Text, TextField } from "../components"
import { DemoTabScreenProps } from "../navigators/DemoNavigator"
import { colors, spacing } from "../theme"
import { isRTL } from "../i18n"
import { useStores } from "../models"
import { observer } from "mobx-react-lite"

function openLinkInBrowser(url: string) {
  Linking.canOpenURL(url).then((canOpen) => canOpen && Linking.openURL(url))
}

export const DemoDebugScreen: FC<DemoTabScreenProps<"DemoDebug">> = observer(function DemoDebugScreen(
  _props,
) {
  const {
    authenticationStore: { logout, update, displayName, setDisplayName, result, setResult },
  } = useStores()
  const displayNameValidator = useMemo(() => {
        if (displayName.length < 2) return "must be at least 1 character"
        if (displayName.length > 30) return "cannot exceed 30 characters"
        return ""
    }, [displayName])
    const [isSubmitted, setIsSubmitted] = useState(false)
    const error = isSubmitted ? displayNameValidator : ""
    useEffect(() => {
      // Return a "cleanup" function that React will run when the component unmounts
      return () => {
        setResult("")
        setDisplayName("")
      }
    }, [setResult, setDisplayName])

    async function updateDisplayName() {
      setIsSubmitted(true)
  
      if (displayNameValidator) return

      update()
      
      // If successful, reset the fields
      setIsSubmitted(false)

    }

  const usingHermes = typeof HermesInternal === "object" && HermesInternal !== null
  // @ts-expect-error
  const usingFabric = global.nativeFabricUIManager != null

  const demoReactotron = React.useMemo(
    () => async () => {
      if (__DEV__) {
        console.tron.display({
          name: "DISPLAY",
          value: {
            appId: Application.applicationId,
            appName: Application.applicationName,
            appVersion: Application.nativeApplicationVersion,
            appBuildVersion: Application.nativeBuildVersion,
            hermesEnabled: usingHermes,
          },
          important: true,
        })
      }
    },
    [],
  )

  const handleLogout = async () => {
    await logout()
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <Text
        style={$reportBugsLink}
        tx="demoDebugScreen.reportBugs"
        onPress={() => openLinkInBrowser("https://github.com/infinitered/ignite/issues")}
      />
      
      {__DEV__ && (
        <>
          <Text style={$title} preset="heading" tx="demoDebugScreen.title" />
          <View style={$itemsContainer}>
            <ListItem LeftComponent={<View style={$item}><Text preset="bold">App Id</Text><Text>{Application.applicationId}</Text></View>} />
            <ListItem LeftComponent={<View style={$item}><Text preset="bold">App Name</Text><Text>{Application.applicationName}</Text></View>} />
            <ListItem LeftComponent={<View style={$item}><Text preset="bold">App Version</Text><Text>{Application.nativeApplicationVersion}</Text></View>} />
            <ListItem LeftComponent={<View style={$item}><Text preset="bold">App Build Version</Text><Text>{Application.nativeBuildVersion}</Text></View>} />
            <ListItem LeftComponent={<View style={$item}><Text preset="bold">Hermes Enabled</Text><Text>{String(usingHermes)}</Text></View>} />
            <ListItem LeftComponent={<View style={$item}><Text preset="bold">Fabric Enabled</Text><Text>{String(usingFabric)}</Text></View>} />
          </View>
          <View style={$buttonContainer}>
            <Button style={$button} tx="demoDebugScreen.reactotron" onPress={demoReactotron} />
            <Text style={$hint} tx={`demoDebugScreen.${Platform.OS}ReactotronHint` as const} />
          </View>
        </>
      )}
      
      <Text style={$title} preset="heading" text="Profile" />
      <View style={$buttonContainer}>
        <Button style={$button} tx="common.logOut" onPress={handleLogout} />
      </View>
      {/* TODO add dark mode option here <Toggle
        label="Dark Mode"
        variant="switch"
        value={themeContext === "dark"}
        onValueChange={(value: boolean) => {
          setThemeContextOverride(value ? "dark" : "light")
        }}
      /> */}
      <View style={$inputRow}>
        <TextField
          value={displayName}
          onChangeText={setDisplayName}
          containerStyle={$textField}
          helper={error}
          status={error ? "error" : undefined}
          autoCapitalize="none"
          autoComplete="name"
          autoCorrect={false}
          label="Update display name:"
          placeholder="Something new"
          onSubmitEditing={updateDisplayName}
        />
        <Button
          text="Update"
          style={$updateButton}
          preset="reversed"
          onPress={updateDisplayName}
        />
      </View>
      <Text text={`${result}`} preset="formHelper" />
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingTop: spacing.lg + spacing.xl,
  paddingBottom: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $title: TextStyle = {
  marginBottom: spacing.lg,
}

const $textField: ViewStyle = {
  paddingRight: spacing.xs,
  flex: 1,
}

const $reportBugsLink: TextStyle = {
  color: colors.tint,
  marginBottom: spacing.lg,
  alignSelf: isRTL ? "flex-start" : "flex-end",
}

const $item: ViewStyle = {
  marginBottom: spacing.md,
}

const $itemsContainer: ViewStyle = {
  marginBottom: spacing.xl,
}

const $button: ViewStyle = {
  marginBottom: spacing.xs,
}

const $buttonContainer: ViewStyle = {
}

const $hint: TextStyle = {
  color: colors.palette.neutral600,
  fontSize: 12,
  lineHeight: 15,
  paddingBottom: spacing.lg,
}

const $inputRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $updateButton: ViewStyle = {
  justifyContent: "flex-end",
  alignItems: "center",
  paddingHorizontal: spacing.xs,
  marginTop: spacing.xl,
  minHeight: spacing.md
}