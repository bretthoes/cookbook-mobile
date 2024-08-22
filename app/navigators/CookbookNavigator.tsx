import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { CookbookListScreen } from "app/screens/CookbookListScreen"
import { RecipeListScreen } from "app/screens/RecipeListScreen"

export type CookbookStackParamList = {
  CookbookList: undefined
  RecipeList: { cookbookId: number }
}

const CookbookStack = createNativeStackNavigator<CookbookStackParamList>()

export function CookbookNavigator() {
  return (
    <CookbookStack.Navigator screenOptions={{ headerShown: false }}>
      <CookbookStack.Screen name="CookbookList" component={CookbookListScreen} />
      <CookbookStack.Screen name="RecipeList" component={RecipeListScreen} />
    </CookbookStack.Navigator>
  )
}
