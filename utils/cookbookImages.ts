const missingCookbookImage = require("../assets/images/cookbooks/missing.png")
const orangeCookbookImage = require("../assets/images/cookbooks/orange.png")
const yellowCookbookImage = require("../assets/images/cookbooks/yellow.png")
const blueCookbookImage = require("../assets/images/cookbooks/blue.png")
const purpleCookbookImage = require("../assets/images/cookbooks/purple.png")
const greenCookbookImage = require("../assets/images/cookbooks/green.png")
const greyCookbookImage = require("../assets/images/cookbooks/grey.png")
const redCookbookImage = require("../assets/images/cookbooks/red.png")
const indigoCookbookImage = require("../assets/images/cookbooks/indigo.png")
const pinkCookbookImage = require("../assets/images/cookbooks/pink.png")
const tealCookbookImage = require("../assets/images/cookbooks/teal.png")

const cookbookImagesByIndex = [
  redCookbookImage,
  orangeCookbookImage,
  indigoCookbookImage,
  yellowCookbookImage,
  pinkCookbookImage,
  tealCookbookImage,
  blueCookbookImage,
  purpleCookbookImage,
  greenCookbookImage,
  greyCookbookImage,
]

/**
 * Returns a consistent image for a cookbook based on its ID.
 * Uses the last hex character of the UUID to pick a colour slot.
 */
export const getCookbookImage = (id: string): number => {
  if (!id) return missingCookbookImage
  const lastChar = id[id.length - 1]
  const index = parseInt(lastChar, 16) % cookbookImagesByIndex.length
  return cookbookImagesByIndex[index] ?? missingCookbookImage
}
