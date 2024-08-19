import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { RouteProp, useRoute } from "@react-navigation/native"
import { CookbookStackParamList } from "../navigators/CookbookNavigator"

type CookbookDetailScreenRouteProp = RouteProp<CookbookStackParamList, "CookbookDetail">

const mockCookbooks = {
  "1": { title: "Italian Cuisine", description: "A collection of traditional Italian recipes." },
  "2": { title: "Healthy Meals", description: "Delicious and nutritious meals for a healthy lifestyle." },
  "3": { title: "Quick & Easy", description: "Recipes you can prepare in 30 minutes or less." },
}

export function CookbookDetailScreen() {
  const route = useRoute<CookbookDetailScreenRouteProp>()
  const { cookbookId } = route.params

  const cookbook = mockCookbooks[1] || { title: "Cookbook Not Found", description: "" }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{cookbook.title}</Text>
      <Text style={styles.description}>{cookbook.description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#666",
  },
})
