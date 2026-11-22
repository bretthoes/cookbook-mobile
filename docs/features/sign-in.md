# Signing in

Apple, Google, Facebook, and email all end in the same decision: Cookbooks, or a short onboarding. The decision uses two facts. The display name belongs to the account. Dark mode, text size, and whether onboarding has been finished belong to the phone.

How the API checks a provider token and finds or creates the account is in SharedCookbook `docs/features/social-sign-in.md`.

## Where a session comes from

[login-options.tsx](../../app/login-options.tsx) and [register-options.tsx](../../app/register-options.tsx) offer the same providers. Email continues to [log-in.tsx](../../app/log-in.tsx) or [register.tsx](../../app/register.tsx). Apple is offered on iOS.

Apple, Google, and Facebook open the provider's own sheet, then exchange that token for a session. The signing-in screen shows during the exchange. Closing the sheet stays on the options screen. An Apple or Google failure shows an error there. When Apple includes an email, the app saves it before the exchange. The name check below compares the account's display name to that email.

Email login can remember the address and password in SecureStore. The box is on by default. Turning it off removes both.

## What happens next

[useNavigateAfterAuth](../../hooks/useNavigateAfterAuth.ts) runs after Apple, Google, Facebook, or a successful email login. It asks the server for the display name. The server returns the account email when no name has been chosen, and a display name cannot contain `@`, so a match means the person still needs to pick one. A failed request follows the "already has a name" row.

| Account has a display name | This phone has finished onboarding | Next |
| --- | --- | --- |
| Yes | Yes | Cookbooks |
| Yes | No | Onboarding, starting at dark mode |
| No | Yes | Onboarding, starting at the display name |
| No | No | Onboarding, starting at the display name |

Email registration does not use this table. It collects the name on its own screen, then opens onboarding at dark mode.

Signing in from an invite link follows this same decision. Accepting the invite means opening the link again. That screen is in [invitations.md](./invitations.md).

## Email registration

[register.tsx](../../app/register.tsx) walks through language, email, password, email verification, display name, and a short success screen.

On the verification step the app tries a silent login immediately and again every 8 seconds. The password for that login stays in memory on the screen. Silent login shows no error and does not resend the confirmation email. There is also a button to check now, and a resend with a 60-second cooldown. Going back from verification returns to the email step and clears the password. Once the display name step is reached, back is gone.

A name is letters, marks, spaces, hyphens, and apostrophes, at most 60 characters. The success screen waits one second, then opens onboarding with the name step already done.

## Onboarding

[onboarding.tsx](<../../app/(logged-in)/onboarding.tsx>) is display name (when this visit includes it), dark mode, text size, and a done screen. Done waits one second, records that this phone has finished onboarding, and replaces to Cookbooks.

Whether this visit includes the name is decided when the screen opens. That flag is then removed.

| Piece | Where | Scope |
| --- | --- | --- |
| Display name | Server | Account |
| `hasCompletedOnboarding` | MMKV | Phone. Set when the done screen finishes |
| `onboarding.skipDisplayName` | MMKV | The next time onboarding opens. Read once, then removed |

## Where to look in code

| Area | Path |
| --- | --- |
| Provider buttons | [app/login-options.tsx](../../app/login-options.tsx), [app/register-options.tsx](../../app/register-options.tsx) |
| Native sheet, then token exchange | [hooks/useSsoAuth.ts](../../hooks/useSsoAuth.ts) |
| Email login and remember me | [app/log-in.tsx](../../app/log-in.tsx) |
| Registration and verification polling | [app/register.tsx](../../app/register.tsx), [hooks/useEmailVerificationPolling.ts](../../hooks/useEmailVerificationPolling.ts) |
| Cookbooks or onboarding | [hooks/useNavigateAfterAuth.ts](../../hooks/useNavigateAfterAuth.ts) |
| "Has this account chosen a name?" | [utils/displayName.ts](../../utils/displayName.ts) |
| Onboarding steps | [app/(logged-in)/onboarding.tsx](<../../app/(logged-in)/onboarding.tsx>) |
