import { Header, HeaderProps } from "@/components/Header"
import { useNavigation } from "@react-navigation/native"
import { useLayoutEffect } from "react"

/**
 * Sets the react-navigation header from a screen component.
 */
export function useHeader(
  headerProps: HeaderProps,
  deps: Parameters<typeof useLayoutEffect>[1] = [],
) {
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => <Header {...headerProps} />,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, navigation])
}
