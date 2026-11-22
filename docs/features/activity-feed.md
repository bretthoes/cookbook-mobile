# Activity feed

The Feed tab lists what happened in your cookbooks: a recipe added or made, and a member joined, left, or removed. Rows are grouped into Today, Yesterday, This week, and Earlier. Today and Yesterday are calendar days. This week is the five calendar days before yesterday. Anything older is Earlier. Empty groups are left out, and the newest row stays first inside each group.

A row that names a recipe opens that recipe. A row the server marks important is emphasized.

## What a row says

The line depends on the kind of event and whether it was you.

| Event | Someone else | You |
| --- | --- | --- |
| Recipe added | They added it to the cookbook | You added it |
| Recipe made | They made it | You made it |
| Member joined | They joined | You joined |
| Member left | They left | You left |
| Member removed | They removed someone | You removed someone |

Joined and left use the member the event is about. Removed uses the person who removed them. Any other event shows the cookbook title.

## New rows and the tab dot

The dot on the Feed tab means someone else did something since you last opened the feed. Your own rows never count. The dot is checked again each time you switch tabs, and it is hidden while Feed is the open tab.

Opening Feed remembers what was already unseen and marks the feed seen. Those rows keep a New label for that visit, including anything that arrives while you are looking. Leaving the tab marks the feed seen again, so the next visit starts from then.

The marker is stored on the phone, one per account, so opening the feed on one account leaves the dot in place for the next person who signs in on that phone. The first time an account opens the feed, every row from someone else is New.

## Where to look in code

| Area | Path |
| --- | --- |
| Feed list | [app/(logged-in)/(tabs)/feed.tsx](<../../app/(logged-in)/(tabs)/feed.tsx>) |
| A row | [components/activity/FeedPostItem.tsx](../../components/activity/FeedPostItem.tsx) |
| Day groups and the seen marker | [utils/activityFeed.ts](../../utils/activityFeed.ts) |
| Wording | [utils/activityFeedMessage.ts](../../utils/activityFeedMessage.ts) |
| Tab dot | [hooks/useFeedUnseen.ts](../../hooks/useFeedUnseen.ts), [components/TabBar.tsx](../../components/TabBar.tsx), [components/AndroidTabBar.tsx](../../components/AndroidTabBar.tsx) |
