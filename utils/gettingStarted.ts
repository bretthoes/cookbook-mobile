const DISMISSED_KEY_PREFIX = "hasDismissedGettingStarted"
const SEEN_KEY_PREFIX = "gettingStarted.seen"

/** Dev-only. Forces the checklist on for the signed-in account. */
export const GETTING_STARTED_DEV_PREVIEW_KEY = "gettingStarted.devPreview"

export const GETTING_STARTED_STEPS = ["cookbook", "recipe", "invite"] as const

export type GettingStartedStep = (typeof GETTING_STARTED_STEPS)[number]

/**
 * Where a guided walk is. Every walk starts on the Cookbooks tab.
 * - cookbook: `fab` (new-cookbook button) → `screen` (add cookbook)
 * - recipe: `choose` (a cookbook card) → `fab` (add-recipe button) → `options` → `screen`
 * - invite: `choose` (a cookbook card) → `menu` (cookbook ⋯ menu) → `screen` (share link), which ends it
 */
export type GettingStartedTourPhase = "fab" | "choose" | "menu" | "options" | "screen"

/** The phase shown on the Cookbooks tab, both when a walk starts and when someone backs out to it. */
export function cookbooksTabTourPhase(step: GettingStartedStep): GettingStartedTourPhase {
  return step === "cookbook" ? "fab" : "choose"
}

/** The phase shown inside a cookbook. The cookbook walk never opens one. */
export function cookbookDetailTourPhase(step: GettingStartedStep): GettingStartedTourPhase | null {
  if (step === "recipe") return "fab"
  if (step === "invite") return "menu"
  return null
}

/** Per-account flag so one person's dismiss does not hide the checklist for the next account on this device. */
export function gettingStartedDismissedKey(userId: string | undefined): string {
  const owner = userId?.trim()
  return owner ? `${DISMISSED_KEY_PREFIX}.${owner}` : DISMISSED_KEY_PREFIX
}

/**
 * Per-account flag. A step is done once Got it is tapped on the last screen of its guide.
 * Saving a cookbook or a recipe also sets its step, and so does the list loading with a cookbook.
 */
export function gettingStartedStepKey(
  userId: string | undefined,
  step: GettingStartedStep,
): string {
  const owner = userId?.trim()
  const suffix = owner ? `.${owner}` : ""
  return `${SEEN_KEY_PREFIX}.${step}${suffix}`
}

export function isGettingStartedStep(value: string | undefined): value is GettingStartedStep {
  return value === "cookbook" || value === "recipe" || value === "invite"
}

export function allGettingStartedStepsSeen(seen: Record<GettingStartedStep, boolean>): boolean {
  return GETTING_STARTED_STEPS.every((step) => seen[step])
}

export function accountHasCookbook(cookbooks: readonly unknown[]): boolean {
  return cookbooks.length > 0
}

/** Step 1 is done after its guide, or as soon as the account owns a cookbook. */
export function isCookbookStepDone(seenCookbook: boolean, hasCookbook: boolean): boolean {
  return seenCookbook || hasCookbook
}

/**
 * Steps unlock in order. Every step is listed; locked ones are greyed out.
 * Add a recipe needs a cookbook to put it in. Invite needs the recipe step checked off.
 */
export function isGettingStartedStepUnlocked(
  step: GettingStartedStep,
  seen: Record<GettingStartedStep, boolean>,
  hasCookbook: boolean,
): boolean {
  if (step === "recipe") return hasCookbook
  if (step === "invite") return seen.recipe
  return true
}

export function pendingGettingStartedCount(
  seen: Record<GettingStartedStep, boolean>,
  hasCookbook: boolean,
): number {
  return GETTING_STARTED_STEPS.filter((step) =>
    step === "cookbook" ? !isCookbookStepDone(seen.cookbook, hasCookbook) : !seen[step],
  ).length
}

/** The recipe and invite guides walk through a real cookbook, so they wait for one. */
export function canStartGettingStartedGuide(
  step: GettingStartedStep,
  hasCookbook: boolean,
): boolean {
  return step === "cookbook" || hasCookbook
}

/** Keys Preview getting started clears so the tour can be shown again. */
export function gettingStartedResetKeys(userId: string | undefined): string[] {
  return [
    gettingStartedDismissedKey(userId),
    ...GETTING_STARTED_STEPS.map((step) => gettingStartedStepKey(userId, step)),
  ]
}

/**
 * Visible until every guide has been seen, or the person dismisses it.
 * `devPreview` forces it on only while a step is still unseen.
 */
export function shouldShowGettingStarted(
  dismissed: boolean,
  allStepsSeen: boolean,
  devPreview = false,
): boolean {
  if (allStepsSeen) return false
  if (devPreview) return true
  if (dismissed) return false
  return true
}

/**
 * After saving a cookbook, open it when the loaded list was empty.
 * Undefined means the list has not loaded, so stay on the list.
 * `devPreview` opens it anyway so an existing account can see the empty cookbook.
 */
export function shouldOpenCookbookAfterCreate(
  totalCount: number | undefined,
  devPreview = false,
): boolean {
  if (devPreview) return true
  return totalCount === 0
}
