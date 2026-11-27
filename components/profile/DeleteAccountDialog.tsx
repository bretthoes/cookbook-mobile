import { Button } from "@/components/Button"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

const DELETE_CONFIRMATION = "DELETE"

type DeleteAccountDialogProps = {
  visible: boolean
  confirmation: string
  isDeleting: boolean
  onChangeConfirmation: (value: string) => void
  onClose: () => void
  onSubmit: () => void
}

export function DeleteAccountDialog({
  visible,
  confirmation,
  isDeleting,
  onChangeConfirmation,
  onClose,
  onSubmit,
}: DeleteAccountDialogProps) {
  const { themed, theme } = useAppTheme()

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={$deleteAvoiding}
      >
        <Pressable style={themed($deleteOverlay)} onPress={onClose}>
          <Pressable style={themed($deleteDialog)} onPress={(event) => event.stopPropagation()}>
            <Text
              preset="subheading"
              tx="profileScreen:deleteAccountTitle"
              style={themed($deleteTitle)}
            />
            <Text tx="profileScreen:deleteAccountMessage" />
            <Text
              tx="profileScreen:deleteAccountTypeToConfirm"
              txOptions={{ word: DELETE_CONFIRMATION }}
            />
            <TextField
              value={confirmation}
              onChangeText={onChangeConfirmation}
              placeholderTx="profileScreen:deleteAccountConfirmWord"
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="off"
              onSubmitEditing={onSubmit}
              editable={!isDeleting}
            />
            <View style={$deleteActions}>
              <Button
                tx="common:cancel"
                style={$deleteAction}
                onPress={onClose}
                disabled={isDeleting}
              />
              <Button
                tx="profileScreen:deleteAccountConfirm"
                style={[$deleteAction, { borderColor: theme.colors.error }]}
                textStyle={{ color: theme.colors.error }}
                onPress={onSubmit}
                disabled={confirmation !== DELETE_CONFIRMATION}
                loading={isDeleting}
              />
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export { DELETE_CONFIRMATION }

const $deleteAvoiding: ViewStyle = {
  flex: 1,
}

const $deleteOverlay: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.45)",
  justifyContent: "flex-end",
  paddingHorizontal: theme.spacing.md,
})

const $deleteDialog: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
  borderRadius: theme.spacing.md,
  padding: theme.spacing.lg,
  gap: theme.spacing.sm,
  marginBottom: theme.spacing.lg,
})

const $deleteTitle: ThemedStyle<TextStyle> = () => ({
  textAlign: "center",
})

const $deleteActions: ViewStyle = {
  flexDirection: "row",
  gap: spacing.sm,
}

const $deleteAction: ViewStyle = {
  flex: 1,
}
