import { ImageSourcePropType } from "react-native"

const missingCookbookImage = require("assets/images/cookbooks/missing.png")
const orangeCookbookImage = require("assets/images/cookbooks/orange.png")
const yellowCookbookImage = require("assets/images/cookbooks/yellow.png")
const blueCookbookImage = require("assets/images/cookbooks/blue.png")
const purpleCookbookImage = require("assets/images/cookbooks/purple.png")
const greenCookbookImage = require("assets/images/cookbooks/green.png")
const greyCookbookImage = require("assets/images/cookbooks/grey.png")
const redCookbookImage = require("assets/images/cookbooks/red.png")
const indigoCookbookImage = require("assets/images/cookbooks/indigo.png")
const pinkCookbookImage = require("assets/images/cookbooks/pink.png")
const tealCookbookImage = require("assets/images/cookbooks/teal.png")

/**
 * Returns a consistent image for a cookbook based on its ID.
 * The image is determined by the last digit of the ID to ensure persistence.
 */
export const getCookbookImage = (id: number): ImageSourcePropType => {
  const lastDigit = id % 10

  switch (lastDigit) {
    case 0:
      return redCookbookImage
    case 1:
      return orangeCookbookImage
    case 2:
      return indigoCookbookImage
    case 3:
      return yellowCookbookImage
    case 4:
      return pinkCookbookImage
    case 5:
      return tealCookbookImage
    case 6:
      return blueCookbookImage
    case 7:
      return purpleCookbookImage
    case 8:
      return greenCookbookImage
    case 9:
      return greyCookbookImage
    default:
      return missingCookbookImage
  }
}
