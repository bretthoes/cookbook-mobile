export const validateTitle = (value: string): string | null => {
  if (value.length < 3) return "Title must be at least 3 characters long."
  if (value.length > 20) return "Title must be less than 20 characters long."
  return null
}

export const validateSummary = (value: string | null | undefined): string | null => {
  if (!value || value.trim() === "") return null
  if (value.length > 2000) return "Summary must be less than 2000 characters long."
  return null
}

export const validateTimeInMinutes = (value: string | null | undefined): string | null => {
  if (!value || value.trim() === "") return null
  const parsedValue = parseInt(value)
  if (isNaN(parsedValue)) return "Time must be a valid number."
  if (parsedValue < 0) return "Time cannot be less than 0 minutes."
  if (parsedValue > 1000) return "Time cannot be greater than 1000 minutes."
  return null
}
