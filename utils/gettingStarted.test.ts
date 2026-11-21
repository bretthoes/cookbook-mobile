import { describe, expect, it } from "vitest"
import {
  accountHasCookbook,
  allGettingStartedStepsSeen,
  canStartGettingStartedGuide,
  cookbookDetailTourPhase,
  cookbooksTabTourPhase,
  gettingStartedDismissedKey,
  gettingStartedResetKeys,
  gettingStartedStepKey,
  isCookbookStepDone,
  isGettingStartedStep,
  isGettingStartedStepUnlocked,
  pendingGettingStartedCount,
  shouldOpenCookbookAfterCreate,
  shouldShowGettingStarted,
} from "./gettingStarted"

const none = { cookbook: false, recipe: false, invite: false }

describe("gettingStartedDismissedKey", () => {
  it("scopes the flag to the signed-in account", () => {
    expect(gettingStartedDismissedKey("a@example.com")).toBe(
      "hasDismissedGettingStarted.a@example.com",
    )
    expect(gettingStartedDismissedKey("b@example.com")).not.toBe(
      gettingStartedDismissedKey("a@example.com"),
    )
    expect(gettingStartedDismissedKey(undefined)).toBe("hasDismissedGettingStarted")
    expect(gettingStartedDismissedKey("  ")).toBe("hasDismissedGettingStarted")
  })
})

describe("gettingStartedStepKey", () => {
  it("scopes each guide to the signed-in account", () => {
    expect(gettingStartedStepKey("a@example.com", "cookbook")).toBe(
      "gettingStarted.seen.cookbook.a@example.com",
    )
    expect(gettingStartedStepKey("a@example.com", "recipe")).toBe(
      "gettingStarted.seen.recipe.a@example.com",
    )
    expect(gettingStartedStepKey("b@example.com", "cookbook")).not.toBe(
      gettingStartedStepKey("a@example.com", "cookbook"),
    )
    expect(gettingStartedStepKey(undefined, "invite")).toBe("gettingStarted.seen.invite")
    expect(gettingStartedStepKey("  ", "invite")).toBe("gettingStarted.seen.invite")
  })
})

describe("gettingStartedResetKeys", () => {
  it("includes the dismiss flag and each guide", () => {
    expect(gettingStartedResetKeys("a@example.com")).toEqual([
      "hasDismissedGettingStarted.a@example.com",
      "gettingStarted.seen.cookbook.a@example.com",
      "gettingStarted.seen.recipe.a@example.com",
      "gettingStarted.seen.invite.a@example.com",
    ])
  })
})

describe("isGettingStartedStep", () => {
  it("accepts the three guide ids", () => {
    expect(isGettingStartedStep("cookbook")).toBe(true)
    expect(isGettingStartedStep("recipe")).toBe(true)
    expect(isGettingStartedStep("invite")).toBe(true)
    expect(isGettingStartedStep("")).toBe(false)
    expect(isGettingStartedStep(undefined)).toBe(false)
    expect(isGettingStartedStep("optional")).toBe(false)
  })
})

describe("allGettingStartedStepsSeen", () => {
  it("is true only when every guide has been seen", () => {
    expect(allGettingStartedStepsSeen({ cookbook: true, recipe: true, invite: true })).toBe(true)
    expect(allGettingStartedStepsSeen({ cookbook: true, recipe: false, invite: true })).toBe(false)
  })
})

describe("accountHasCookbook", () => {
  it("is true once the loaded list has a cookbook", () => {
    expect(accountHasCookbook([])).toBe(false)
    expect(accountHasCookbook([{ id: "1" }])).toBe(true)
  })
})

describe("isCookbookStepDone", () => {
  it("is done after the guide or once the account has a cookbook", () => {
    expect(isCookbookStepDone(false, false)).toBe(false)
    expect(isCookbookStepDone(true, false)).toBe(true)
    expect(isCookbookStepDone(false, true)).toBe(true)
  })
})

describe("isGettingStartedStepUnlocked", () => {
  it("always unlocks the cookbook step", () => {
    expect(isGettingStartedStepUnlocked("cookbook", none, false)).toBe(true)
  })

  it("locks the recipe step until the account has a cookbook", () => {
    expect(isGettingStartedStepUnlocked("recipe", { ...none, cookbook: true }, false)).toBe(false)
    expect(isGettingStartedStepUnlocked("recipe", none, true)).toBe(true)
  })

  it("locks the invite step until the recipe step is checked off", () => {
    expect(isGettingStartedStepUnlocked("invite", { ...none, invite: true }, true)).toBe(false)
    expect(isGettingStartedStepUnlocked("invite", { ...none, recipe: true }, true)).toBe(true)
  })
})

describe("pendingGettingStartedCount", () => {
  it("counts every step not checked off, locked or not", () => {
    expect(pendingGettingStartedCount(none, false)).toBe(3)
    expect(pendingGettingStartedCount({ ...none, recipe: true }, true)).toBe(1)
    expect(pendingGettingStartedCount({ cookbook: true, recipe: true, invite: true }, true)).toBe(0)
  })

  it("treats the cookbook step as done when the account has a cookbook", () => {
    expect(pendingGettingStartedCount(none, true)).toBe(2)
  })
})

describe("canStartGettingStartedGuide", () => {
  it("always allows the cookbook guide", () => {
    expect(canStartGettingStartedGuide("cookbook", false)).toBe(true)
  })

  it("needs a cookbook for the recipe and invite guides", () => {
    expect(canStartGettingStartedGuide("recipe", false)).toBe(false)
    expect(canStartGettingStartedGuide("invite", false)).toBe(false)
    expect(canStartGettingStartedGuide("recipe", true)).toBe(true)
    expect(canStartGettingStartedGuide("invite", true)).toBe(true)
  })
})

describe("cookbooksTabTourPhase", () => {
  it("points the cookbook walk at the new-cookbook button", () => {
    expect(cookbooksTabTourPhase("cookbook")).toBe("fab")
  })

  it("has the recipe and invite walks pick a real cookbook first", () => {
    expect(cookbooksTabTourPhase("recipe")).toBe("choose")
    expect(cookbooksTabTourPhase("invite")).toBe("choose")
  })
})

describe("cookbookDetailTourPhase", () => {
  it("uses the add-recipe button for recipes and the menu for invites", () => {
    expect(cookbookDetailTourPhase("recipe")).toBe("fab")
    expect(cookbookDetailTourPhase("invite")).toBe("menu")
  })

  it("has no phase inside a cookbook for the cookbook walk", () => {
    expect(cookbookDetailTourPhase("cookbook")).toBeNull()
  })
})

describe("shouldShowGettingStarted", () => {
  it("shows while a guide is still unseen", () => {
    expect(shouldShowGettingStarted(false, false)).toBe(true)
  })

  it("hides after dismiss or once every guide has been seen", () => {
    expect(shouldShowGettingStarted(true, false)).toBe(false)
    expect(shouldShowGettingStarted(false, true)).toBe(false)
    expect(shouldShowGettingStarted(true, true)).toBe(false)
  })

  it("shows during a dev preview only while a guide is still unseen", () => {
    expect(shouldShowGettingStarted(true, false, true)).toBe(true)
    expect(shouldShowGettingStarted(false, true, true)).toBe(false)
  })
})

describe("shouldOpenCookbookAfterCreate", () => {
  it("opens the new cookbook only when the loaded list was empty", () => {
    expect(shouldOpenCookbookAfterCreate(0)).toBe(true)
    expect(shouldOpenCookbookAfterCreate(1)).toBe(false)
    expect(shouldOpenCookbookAfterCreate(undefined)).toBe(false)
    expect(shouldOpenCookbookAfterCreate(3, true)).toBe(true)
  })
})
