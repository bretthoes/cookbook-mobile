import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { CookbookListScreen } from "app/screens/CookbookListScreen"
import { RecipeListScreen } from "app/screens/RecipeListScreen"
import { RecipeDetailsScreen } from "app/screens/RecipeDetailsScreen"
import { Cookbook } from "app/models/Cookbook"

export type CookbookStackParamList = {
  CookbookList: undefined
  RecipeList: { cookbook: Cookbook }
}

export type RecipeStackParamList = {
  RecipeDetails: { recipeId: number }
}

const CookbookStack = createNativeStackNavigator<CookbookStackParamList>()
const RecipeStack = createNativeStackNavigator<RecipeStackParamList>()

export function CookbookNavigator() {
  return (
    <CookbookStack.Navigator screenOptions={{ headerShown: false }}>
      <CookbookStack.Screen name="CookbookList" component={CookbookListScreen} />
      <CookbookStack.Screen name="RecipeList" component={RecipeListScreen} />
      <RecipeStack.Screen name="RecipeDetails" component={RecipeDetailsScreen} />
    </CookbookStack.Navigator>
  )
}
