# Membership

A cookbook has four roles. The open cookbook's menu, the add button, and each recipe's menu follow the role of the person looking at them. View Members on that menu is the member list for the cookbook.

`canAddRecipe` and `canSendInvite` in [membershipTier.ts](../../utils/membershipTier.ts) match `CookbookMembership` on the API. The API still decides.

## Roles

| Role | On this cookbook | On a recipe |
| --- | --- | --- |
| Owner | Add a recipe, send an invite, edit the cookbook, manage members, leave after handing the cookbook to someone else | Edit and delete any recipe |
| Admin | Add a recipe, send an invite, manage members below admin | Edit and delete any recipe |
| Contributor | Add a recipe, send an invite | Edit and delete recipes they added |
| Viewer | View recipes, view members, leave | Read the recipe |

Edit Cookbook is in the menu once the loaded role is Owner.

## While the role is loading

Opening a cookbook shows the add button and Send Invite right away. When the role for this cookbook arrives, a viewer loses both. The getting-started walk then says they can only view this cookbook. That walk is in [getting-started-tour.md](./getting-started-tour.md).

View Members and Leave stay in the menu the whole time.

## Leaving

Leave asks for confirmation, then removes the membership and returns to Cookbooks.

An owner of a cookbook that still has other members is stopped and sent to View Members to choose a new owner. An owner who is the only member can leave.

## Members

View Members opens [membership/list.tsx](<../../app/(logged-in)/membership/list.tsx>) for the open cookbook. Your own row is marked "(You)".

An admin or owner can change or remove someone else. Their own row has no actions, and the edit screen shows the member as not found.

| Who is editing | Who they opened | Roles they can save |
| --- | --- | --- |
| Owner | Anyone else | Viewer, Contributor, Admin, Owner |
| Admin | A viewer or contributor | Viewer, Contributor, Admin |
| Admin | An admin or the owner | None |

Choosing Owner asks for confirmation, because it gives this cookbook away. Save reloads the members and returns to that person. The previous owner is then a contributor.

Removing a member asks for confirmation, returns to the list, and drops that row.

## Recipes

The recipe menu is there for the person who added it, and for an admin or owner. It holds Edit, Print, and Delete. `isAuthor` on the recipe is what marks the person who added it.

## Where to look in code

| Area | Path |
| --- | --- |
| Role checks | [utils/membershipTier.ts](../../utils/membershipTier.ts) |
| Cookbook menu, add button, leave | [app/(logged-in)/cookbook/[id]/index.tsx](<../../app/(logged-in)/cookbook/[id]/index.tsx>) |
| Member list, detail, edit | [app/(logged-in)/membership/](<../../app/(logged-in)/membership/>) |
| Role in memory, including a handover | [stores/membershipStore.ts](../../stores/membershipStore.ts) |
| Recipe menu | [app/(logged-in)/recipe/[id]/index.tsx](<../../app/(logged-in)/recipe/[id]/index.tsx>) |
