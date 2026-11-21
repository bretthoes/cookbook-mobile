import { describe, expect, it } from "vitest"
import type { NotificationItem } from "@/types/notification"
import {
  activityFeedBucket,
  feedLastSeenKey,
  groupActivityFeed,
  isUnseenActivity,
} from "./activityFeed"

const now = new Date(2026, 10, 20, 18, 0)

function item(id: string, created: Date, actorIsCurrentUser = false): NotificationItem {
  return {
    id,
    actionType: 6,
    created: created.toISOString(),
    cookbookId: "c1",
    cookbookTitle: "Family",
    actorIsCurrentUser,
  }
}

describe("feedLastSeenKey", () => {
  it("scopes the marker to the signed-in account", () => {
    expect(feedLastSeenKey("a@example.com")).toBe("feed.lastSeenAt.a@example.com")
    expect(feedLastSeenKey(undefined)).toBe("feed.lastSeenAt")
    expect(feedLastSeenKey("  ")).toBe("feed.lastSeenAt")
  })
})

describe("activityFeedBucket", () => {
  it("buckets by calendar day, not by 24-hour windows", () => {
    expect(activityFeedBucket(new Date(2026, 10, 20, 0, 5).toISOString(), now)).toBe("today")
    expect(activityFeedBucket(new Date(2026, 10, 19, 23, 55).toISOString(), now)).toBe("yesterday")
    expect(activityFeedBucket(new Date(2026, 10, 15, 12).toISOString(), now)).toBe("thisWeek")
    expect(activityFeedBucket(new Date(2026, 10, 13, 12).toISOString(), now)).toBe("earlier")
  })

  it("treats a timestamp slightly in the future as today", () => {
    expect(activityFeedBucket(new Date(2026, 10, 20, 18, 1).toISOString(), now)).toBe("today")
  })
})

describe("groupActivityFeed", () => {
  it("groups newest-first items into ordered sections and skips empty ones", () => {
    const items = [
      item("1", new Date(2026, 10, 20, 9)),
      item("2", new Date(2026, 10, 20, 8)),
      item("3", new Date(2026, 10, 1)),
    ]
    const sections = groupActivityFeed(items, now)
    expect(sections.map((s) => s.bucket)).toEqual(["today", "earlier"])
    expect(sections[0].data.map((i) => i.id)).toEqual(["1", "2"])
    expect(sections[0].titleTx).toBe("feedScreen:today")
  })

  it("returns nothing for an empty feed", () => {
    expect(groupActivityFeed([], now)).toEqual([])
  })
})

describe("isUnseenActivity", () => {
  const seenAt = new Date(2026, 10, 20, 12).toISOString()

  it("is new when it happened after the feed was last opened", () => {
    expect(isUnseenActivity(item("1", new Date(2026, 10, 20, 13)), seenAt)).toBe(true)
    expect(isUnseenActivity(item("1", new Date(2026, 10, 20, 11)), seenAt)).toBe(false)
  })

  it("is new when the feed has never been opened", () => {
    expect(isUnseenActivity(item("1", new Date(2026, 10, 20, 11)), undefined)).toBe(true)
  })

  it("never counts your own actions or missing activity", () => {
    expect(isUnseenActivity(item("1", new Date(2026, 10, 20, 13), true), seenAt)).toBe(false)
    expect(isUnseenActivity(null, seenAt)).toBe(false)
  })
})
