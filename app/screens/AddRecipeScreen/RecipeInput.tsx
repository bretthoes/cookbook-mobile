import React, { FC, useState } from "react"
import { TextField } from "app/components"

interface RecipeInputProps {
  placeholder: string
  value: string
  onChangeText: (value: string) => void
  validation?: (value: string) => string | null
  numeric?: boolean
  multiline?: boolean
}

export const RecipeInput: FC<RecipeInputProps> = ({
  placeholder,
  value,
  onChangeText,
  validation,
  numeric = false,
  multiline = false
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>("")

  const handleChange = (text: string) => {
    onChangeText(text)
    if (validation) {
      const error = validation(text)
      setErrorMessage(error)
    }
  }

  return (
    <TextField
      value={value}
      onChangeText={handleChange}
      placeholder={placeholder}
      helper={errorMessage ?? ""}
      status={errorMessage ? "error" : undefined}
      multiline={multiline}
      {...(numeric ? { inputMode: "numeric", keyboardType: "numeric" } : {})}
    />
  )
}
