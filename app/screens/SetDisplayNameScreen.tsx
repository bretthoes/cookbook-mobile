import React, { FC, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Screen, Text, TextField } from "app/components"
import { useStores } from "app/models"
import { useNavigation } from "@react-navigation/native"
import { colors, spacing } from "app/theme"

interface SetDisplayNameScreenProps extends AppStackScreenProps<"SetDisplayName"> {}

export const SetDisplayNameScreen: FC<SetDisplayNameScreenProps> = observer(function SetDisplayNameScreen() {
    const [displayName, setDisplayName] = useState("")
  
    const displayNameValidator = useMemo(() => {
      if (displayName.length < 3) return "must be at least 2 characters"
      if (displayName.length > 30) return "cannot exceed 30 characters"
      return ""
  }, [displayName])
    
    const [isSubmitted, setIsSubmitted] = useState(false)
    const {
      authenticationStore: {
        update
      },
    } = useStores()
    const navigation = useNavigation<AppStackScreenProps<"SetDisplayName">["navigation"]>()
    const error = isSubmitted ? displayNameValidator : ""

    async function forward() {
      setIsSubmitted(true)
  
      if (displayNameValidator) return
      
      
      if (displayName) await update(displayName)
  
      // If successful, reset the fields
      setIsSubmitted(false)

      // navigate to email verification screen
      //navigation.push("")
    }

    
  return (
    <Screen style={$root} preset="scroll">
      {<Text text="No special characters!" size="sm" weight="light" style={$hint} />}
      <TextField
        value={displayName}
        onChangeText={setDisplayName}
        containerStyle={$textField}
        helper={error}
        status={error ? "error" : undefined}
        autoCapitalize="none"
        autoComplete="name"
        autoCorrect={false}
        label="Display name (optional)"
        placeholder="This is how others will see you"
        onSubmitEditing={() => forward}
      />

      <Button
        testID="login-button"
        text="Continue to app"
        style={$tapButton}
        preset="reversed"
        onPress={forward}
      />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $hint: TextStyle = {
  color: colors.tint,
  marginBottom: spacing.md,
}

const $textField: ViewStyle = {
  marginBottom: spacing.lg,
}

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
  marginBottom: spacing.xs
}
