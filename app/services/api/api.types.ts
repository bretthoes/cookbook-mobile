/**
 * These types indicate the shape of the data you expect to receive from your
 * API endpoint, assuming it's a JSON object like we have.
 */
export interface EpisodeItem {
  title: string
  pubDate: string
  link: string
  guid: string
  author: string
  thumbnail: string
  description: string
  content: string
  enclosure: {
    link: string
    type: string
    length: number
    duration: number
    rating: { scheme: string; value: string }
  }
  categories: string[]
}

export interface ApiFeedResponse {
  status: string
  feed: {
    url: string
    title: string
    link: string
    author: string
    description: string
    image: string
  }
  items: EpisodeItem[]
}

export interface CookbookItem {
  id: number,
  title: string,
  imagePath: string,
  membersCount: number
}

export interface ApiCookbooksResponse {
  pageNumber: number,
  totalPages: number,
  totalCount: number,
  items: CookbookItem[]
}

export interface RecipeItem {
  id: number,
  title: string,
  authorId: number,
  author: string,
  summary: string,
  imagePath: string,
  videoPath: string,
  preparationTimeInMinutes: number,
  cookingTimeInMinutes: number,
  bakingTimeInMinutes: number,
  servings: number,
  directions: RecipeDirection[],
  ingredients: RecipeIngredient[],
  images: RecipeImage[]
}

export interface RecipeDirection {
  id: number,
  text: string,
  ordinal: number,
  image: string
}

export interface RecipeImage {
  id: number,
  imageUrl: string,
  ordinal: number
}

export interface RecipeIngredient {
  id: number,
  name: string,
  optional: boolean,
  ordinal: number
}

export interface ApiRecipesResponse {
  pageNumber: number,
  totalPages: number,
  totalCount: number,
  items: RecipeItem[]
}

/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number
}
