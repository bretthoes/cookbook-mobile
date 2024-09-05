import React from "react"
import { View, Text, Button } from "react-native"

// TODO implement
export const AddCookbookScreen = () => {
  return (
    <View>
      <Text>Add a New Cookbook</Text>
      <Button title="Save Cookbook" onPress={handleSaveCookbook} />
    </View>
  )
}

const handleSaveCookbook = () => {
}
