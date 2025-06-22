import { ComponentType, useMemo } from "react"
import {
  Image,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
  ViewStyle,
} from "react-native"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"

export type IconTypes = keyof typeof iconRegistry

interface IconProps extends TouchableOpacityProps {
  /**
   * The name of the icon
   */
  icon: IconTypes

  /**
   * An optional tint color for the icon
   */
  color?: string

  /**
   * An optional size for the icon. If not provided, the icon will be sized to the icon's resolution.
   */
  size?: number

  /**
   * Style overrides for the icon image
   */
  style?: StyleProp<ImageStyle>

  /**
   * Style overrides for the icon container
   */
  containerStyle?: StyleProp<ViewStyle>

  /**
   * An optional function to be called when the icon is pressed
   */
  onPress?: TouchableOpacityProps["onPress"]
}

/**
 * A component to render a registered icon.
 * It is wrapped in a <TouchableOpacity /> if `onPress` is provided, otherwise a <View />.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/Icon/}
 * @param {IconProps} props - The props for the `Icon` component.
 * @returns {JSX.Element} The rendered `Icon` component.
 */
export function Icon(props: IconProps) {
  const {
    icon,
    color,
    size,
    style: $imageStyleOverride,
    containerStyle: $containerStyleOverride,
    onPress,
  } = props
  const { themed } = useAppTheme()

  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedImage = useMemo(() => themed($image), [themed])

  const Container = onPress ? TouchableOpacity : View

  if (onPress) {
    return (
      <TouchableOpacity style={[$themedContainer, $containerStyleOverride]} onPress={onPress}>
        <Image
          source={iconRegistry[icon]}
          style={[
            $themedImage,
            size ? { width: size, height: size } : undefined,
            color ? { tintColor: color } : undefined,
            $imageStyleOverride,
          ]}
        />
      </TouchableOpacity>
    )
  }

  return (
    <View style={[$themedContainer, $containerStyleOverride]}>
      <Image
        source={iconRegistry[icon]}
        style={[
          $themedImage,
          size ? { width: size, height: size } : undefined,
          color ? { tintColor: color } : undefined,
          $imageStyleOverride,
        ]}
      />
    </View>
  )
}

export const iconRegistry = {
  addRecipe: require("../../assets/icons/addRecipe.png"),
  back: require("../../assets/icons/back.png"),
  bell: require("../../assets/icons/bell.png"),
  camera: require("../../assets/icons/camera.png"),
  caretLeft: require("../../assets/icons/caretLeft.png"),
  caretRight: require("../../assets/icons/caretRight.png"),
  check: require("../../assets/icons/check.png"),
  clap: require("../../assets/icons/demo/clap.png"),
  community: require("../../assets/icons/demo/community.png"),
  components: require("../../assets/icons/demo/components.png"),
  cookbook: require("../../assets/icons/cookbook.png"),
  cookbooks: require("../../assets/icons/cookbooks.png"),
  create: require("../../assets/icons/create.png"),
  darkMode: require("../../assets/icons/darkMode.png"),
  debug: require("../../assets/icons/demo/debug.png"),
  github: require("../../assets/icons/demo/github.png"),
  heart: require("../../assets/icons/demo/heart.png"),
  hidden: require("../../assets/icons/hidden.png"),
  invite: require("../../assets/icons/invite.png"),
  ladybug: require("../../assets/icons/ladybug.png"),
  languages: require("../../assets/icons/languages.png"),
  link: require("../../assets/icons/link.png"),
  lock: require("../../assets/icons/lock.png"),
  mail: require("../../assets/icons/mail.png"),
  membership: require("../../assets/icons/membership.png"),
  menu: require("../../assets/icons/menu.png"),
  more: require("../../assets/icons/more.png"),
  pin: require("../../assets/icons/demo/pin.png"),
  podcast: require("../../assets/icons/demo/podcast.png"),
  settings: require("../../assets/icons/settings.png"),
  slack: require("../../assets/icons/demo/slack.png"),
  user: require("../../assets/icons/user.png"),
  view: require("../../assets/icons/view.png"),
  x: require("../../assets/icons/x.png"),
}

const $container: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  justifyContent: "center",
})

const $image: ThemedStyle<ImageStyle> = () => ({
  width: 24,
  height: 24,
  resizeMode: "contain",
})
