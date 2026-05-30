import { useCookbookById } from "@/hooks/queries/useCookbooksQuery"
import { useUiStore } from "@/stores/uiStore"

export function useSelectedCookbook() {
  const selectedCookbookId = useUiStore((s) => s.selectedCookbookId)
  const setSelectedCookbookId = useUiStore((s) => s.setSelectedCookbookId)
  const { cookbook, isLoading } = useCookbookById(selectedCookbookId)
  return {
    selected: cookbook,
    selectedCookbookId,
    setSelectedById: setSelectedCookbookId,
    isLoading,
  }
}
