# Invitations

A member sends an email invite or a shareable link from the cookbook. Someone else accepts it from the pending list or by opening the link. Minting, hashing, the 14-day window, and creating the membership are the API's job, documented in SharedCookbook `docs/features/cookbook-share-link.md`. That doc covers share links. Email invites are the other mechanism. This doc is the app around both.

Who can send is `canSendInvite` in [membershipTier.ts](../../utils/membershipTier.ts): Contributor and above. The guided walk that spotlights Send Invite is in [getting-started-tour.md](./getting-started-tour.md).

## Sending

Send Invite on the cookbook opens [add-link.tsx](<../../app/(logged-in)/invitation/add-link.tsx>) with a link already minted. Invite by email is a quieter row under that card and opens [add-email.tsx](<../../app/(logged-in)/invitation/add-email.tsx>). Back from email returns to the link.

**Email** ([add-email.tsx](<../../app/(logged-in)/invitation/add-email.tsx>)). The address is checked on the device: non-empty, at least 6 characters, and a single `@` with a dot in the domain. The store turns the API result into a message on the screen:

| API result    | Message                                         | Getting-started invite step |
| ------------- | ----------------------------------------------- | --------------------------- |
| ok            | "Your invite has been sent!"                    | Done                        |
| not-found     | "No account exists with that email."            | Unchanged                   |
| conflict      | "They've already been invited."                 | Unchanged                   |
| anything else | "Something went wrong, please try again later." | Unchanged                   |

The field clears after every response. Those four strings are fixed in [invitationStore.ts](../../stores/invitationStore.ts).

**Link** ([add-link.tsx](<../../app/(logged-in)/invitation/add-link.tsx>)). Opening the screen mints one token for the selected cookbook. The box shows `sharedcookbook.com/invite/…` (`inviteLinkPreview`). Copy and share still use the full `https://sharedcookbook.com/invite/?t=` URL (`INVITE_BASE_URL` in [config.base.ts](../../config/config.base.ts)). The copy icon puts that URL on the clipboard and marks the getting-started invite step done. Share sends that same URL and marks the step done only when the share sheet reports `Share.sharedAction`. A cancelled sheet on iOS does not. Minting again is a new token; the previous one stays redeemable until it expires.

## Opening a link

`https://sharedcookbook.com/invite/?t=<token>` hits [invite/index.tsx](../../app/invite/index.tsx), which redirects to `/i/<token>` ([i/[token].tsx](../../app/i/[token].tsx)). A missing `t` redirects home. The token screen sits outside the logged-in layout, so it can render signed out. The logged-in layout would have sent the person to login and dropped the token.

| State                                        | What the screen shows                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Signed out                                   | "Please log in to view and accept this invitation" and a button to `/login-options`. The invitation is not fetched |
| Signed in, loading                           | A spinner                                                                                                          |
| Signed in, token found                       | Cookbook image and title, Accept, Decline                                                                          |
| Missing token, or the fetch returned nothing | The empty state "We couldn't find your invitation anywhere"                                                        |
| Accept or decline in flight                  | The circular progress screen, at least one second                                                                  |
| Accepted                                     | Success, then Back to cookbooks                                                                                    |
| Declined                                     | Declined, then Back to cookbooks                                                                                   |
| API conflict                                 | "This invitation link has already been redeemed."                                                                  |
| Other accept or decline failure              | The matching failed message                                                                                        |

Accept and decline call the token endpoint (`byToken: true`). Conflict is the client's label for a 409. What the API treats as a conflict is in the share-link doc.

The login button pushes `/login-options` and does not store the token. After sign-in, [useNavigateAfterAuth](../../hooks/useNavigateAfterAuth.ts) goes to onboarding or Cookbooks, described in [sign-in.md](./sign-in.md). The person opens the link again to accept.

## Pending email invites

Profile → pending invitations opens [invitation/index.tsx](<../../app/(logged-in)/invitation/index.tsx>). The list is email invites for the signed-in account (`GET` invitations), not share links. Accept and Reject call `respond` with the invitation id. A success drops that row from the in-memory list. The header back button replaces to Cookbooks.

## Where to look in code

| Area                              | Path                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| Email, link, and the pending list | [app/(logged-in)/invitation/](<../../app/(logged-in)/invitation/>)                               |
| Link entry and the token screen   | [app/invite/index.tsx](../../app/invite/index.tsx), [app/i/[token].tsx](../../app/i/[token].tsx) |
| Invite URL and email check        | [utils/invitations.ts](../../utils/invitations.ts)                                               |
| Send, mint, accept, decline       | [stores/invitationStore.ts](../../stores/invitationStore.ts)                                     |
| Card copy on the pending list     | [utils/invitationFormat.ts](../../utils/invitationFormat.ts)                                     |
