import { describe, expect, it } from "vitest"
import { NotificationActionTypeValues } from "@/types/notification"
import { getActivityFeedMessageKey } from "@/utils/activityFeedMessage"

const { NewRecipe, RecipeMade, MemberJoined, MemberLeft, MemberRemoved } =
  NotificationActionTypeValues

describe("getActivityFeedMessageKey", () => {
  it("uses You when the current user added the recipe", () => {
    expect(
      getActivityFeedMessageKey({ actionType: NewRecipe, actorIsCurrentUser: true }),
    ).toBe("activityFeedScreen:newRecipeYou")
  })

  it("names the actor when someone else added the recipe", () => {
    expect(getActivityFeedMessageKey({ actionType: NewRecipe })).toBe(
      "activityFeedScreen:newRecipe",
    )
  })

  it("uses You when the current user made the recipe", () => {
    expect(
      getActivityFeedMessageKey({ actionType: RecipeMade, actorIsCurrentUser: true }),
    ).toBe("activityFeedScreen:recipeMadeYou")
  })

  it("uses You when the current user joined", () => {
    expect(
      getActivityFeedMessageKey({ actionType: MemberJoined, subjectIsCurrentUser: true }),
    ).toBe("activityFeedScreen:memberJoinedYou")
  })

  it("uses You when the current user left", () => {
    expect(
      getActivityFeedMessageKey({ actionType: MemberLeft, subjectIsCurrentUser: true }),
    ).toBe("activityFeedScreen:memberLeftYou")
  })

  it("uses You when the current user removed someone", () => {
    expect(
      getActivityFeedMessageKey({ actionType: MemberRemoved, actorIsCurrentUser: true }),
    ).toBe("activityFeedScreen:memberRemovedYou")
  })

  it("names both people when someone else removed a member", () => {
    expect(getActivityFeedMessageKey({ actionType: MemberRemoved })).toBe(
      "activityFeedScreen:memberRemoved",
    )
  })
})
