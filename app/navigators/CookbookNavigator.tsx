import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { CookbookListScreen } from "app/screens/CookbookListScreen"
import { CookbookDetailScreen } from "app/screens/CookbookDetailScreen"

export type CookbookStackParamList = {
  CookbookList: undefined
  CookbookDetail: { cookbookId: number }
}

const CookbookStack = createNativeStackNavigator<CookbookStackParamList>()

export function CookbookNavigator() {
  return (
    <CookbookStack.Navigator screenOptions={{ headerShown: false }}>
      <CookbookStack.Screen name="CookbookList" component={CookbookListScreen} />
      <CookbookStack.Screen name="CookbookDetail" component={CookbookDetailScreen} />
    </CookbookStack.Navigator>
  )
}
