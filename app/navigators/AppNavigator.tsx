/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import React from "react"
import { useColorScheme } from "react-native"
import * as Screens from "app/screens"
import Config from "../config"
import { useStores } from "../models"
import { DemoNavigator, DemoTabParamList } from "./DemoNavigator"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import { colors } from "app/theme"

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 *   https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type AppStackParamList = {
  Login: undefined
  Demo: NavigatorScreenParams<DemoTabParamList>
  // 🔥 Your screens go here
	RecipeDetails: undefined
	CookbookDetails: undefined
	AddCookbook: undefined
	AddRecipe: undefined
	AddInvite: undefined
	MembersList: undefined
	MembershipDetails: undefined
	InvitationsList: undefined
	Register: undefined
	EditRecipe: undefined
	EmailVerification: undefined
	SetDisplayName: undefined
	ForgotPassword: undefined
	ResetPassword: undefined
	RecipeUrl: undefined
	// IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
}

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = observer(function AppStack() {
  const {
    authenticationStore: { isAuthenticated, loadStoredTokens },
  } = useStores()

  React.useEffect(() => {
    loadStoredTokens()
  }, [loadStoredTokens])

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, navigationBarColor: colors.background }}
      initialRouteName={isAuthenticated ? "Demo" : "Login"}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Demo" component={DemoNavigator} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Screens.LoginScreen} />
			    <Stack.Screen name="Register" component={Screens.RegisterScreen} />
          <Stack.Screen name="EmailVerification" component={Screens.EmailVerificationScreen} />
          <Stack.Screen name="SetDisplayName" component={Screens.SetDisplayNameScreen} />
			    <Stack.Screen name="ForgotPassword" component={Screens.ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={Screens.ResetPasswordScreen} />
        </>
      )}

      {/** 🔥 Your screens go here */}
			<Stack.Screen name="RecipeDetails" component={Screens.RecipeDetailsScreen} />
			<Stack.Screen name="CookbookDetails" component={Screens.CookbookDetailsScreen} />
			<Stack.Screen name="AddCookbook" component={Screens.AddCookbookScreen} />
			<Stack.Screen name="AddRecipe" component={Screens.AddRecipeScreen} />
			<Stack.Screen name="AddInvite" component={Screens.AddInviteScreen} />
			<Stack.Screen name="MembersList" component={Screens.MembersListScreen} />
			<Stack.Screen name="MembershipDetails" component={Screens.MembershipDetailsScreen} />
			<Stack.Screen name="InvitationsList" component={Screens.InvitationsListScreen} />
			<Stack.Screen name="EditRecipe" component={Screens.EditRecipeScreen} />
			<Stack.Screen name="RecipeUrl" component={Screens.RecipeUrlScreen} />
			{/* IGNITE_GENERATOR_ANCHOR_APP_STACK_SCREENS */}
    </Stack.Navigator>
  )
})

export interface NavigationProps
  extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  const colorScheme = useColorScheme()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      <AppStack />
    </NavigationContainer>
  )
})
