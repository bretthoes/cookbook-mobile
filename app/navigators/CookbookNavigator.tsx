import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { CookbookListScreen } from "app/screens/CookbookListScreen"
import { RecipeListScreen } from "app/screens/RecipeListScreen"
import { RecipeDetailsScreen } from "app/screens/RecipeDetailsScreen/RecipeDetailsScreen"
import { Cookbook } from "app/models/Cookbook"
import { AddRecipeScreen } from "app/screens/AddRecipe"
import { AddCookbookScreen } from "app/screens/AddCookbook"

export type CookbookStackParamList = {
  CookbookList: undefined
  RecipeList: { cookbook: Cookbook }
  AddCookbook: undefined
}

export type RecipeStackParamList = {
  RecipeDetails: { recipeId: number }
  AddRecipe: { cookbookId: number }
}

const CookbookStack = createNativeStackNavigator<CookbookStackParamList>()
const RecipeStack = createNativeStackNavigator<RecipeStackParamList>()

export function CookbookNavigator() {
  return (
    <CookbookStack.Navigator screenOptions={{ headerShown: false }}>
      <CookbookStack.Screen name="CookbookList" component={CookbookListScreen} />
      <CookbookStack.Screen name="RecipeList" component={RecipeListScreen} />
      <CookbookStack.Screen name="AddCookbook" component={AddCookbookScreen} />
      <RecipeStack.Screen name="RecipeDetails" component={RecipeDetailsScreen} />
      <RecipeStack.Screen name="AddRecipe" component={AddRecipeScreen} />
    </CookbookStack.Navigator>
  )
}
