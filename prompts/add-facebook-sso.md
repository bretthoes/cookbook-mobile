# Add Facebook/Meta/Instagram SSO

You are implementing Facebook Login as a third SSO option (alongside existing Google and Apple) across a React Native mobile app (`cookbook-mobile`) and a .NET 8 backend (`SharedCookbook`). Facebook, Instagram, and Meta accounts all authenticate through the same "Facebook Login" product, so a single integration covers all three.

Follow the existing Google and Apple SSO patterns exactly. Every layer of the stack needs a Facebook equivalent. The sections below give you the existing code for each layer, then describe precisely what to create or modify for Facebook.

---

## Architecture Overview

The SSO flow:

1. **Mobile hook** obtains a provider token from a native SDK.
2. **Screen** calls the hook, passes the token to the **MobX auth store**.
3. **Auth store** calls the **API service**, which POSTs the token to the backend.
4. **Backend endpoint** dispatches a **MediatR command**.
5. **Command handler** calls `IExternalLoginService` to **verify the token** and find-or-create the user.
6. `SignInPrincipalFactory` builds a `ClaimsPrincipal`, and the endpoint returns a bearer token response.

---

## LAYER 1 -- Mobile Hook

### Existing: `hooks/useGoogleSignIn.ts`

```ts
import Config from "@/config"
import { useCallback } from "react"
import { GoogleSignin } from "@react-native-google-signin/google-signin"

let isConfigured = false

function ensureConfigured() {
  if (isConfigured) return
  const webClientId = (Config as { GOOGLE_WEB_CLIENT_ID?: string }).GOOGLE_WEB_CLIENT_ID
  if (webClientId && webClientId !== "CHANGEME") {
    GoogleSignin.configure({ webClientId })
    isConfigured = true
  }
}

export function useGoogleSignIn() {
  const signIn = useCallback(async (): Promise<{ idToken: string } | null> => {
    ensureConfigured()
    try {
      const response = await GoogleSignin.signIn({})
      if (response.type !== "success" || !response.data?.idToken) return null
      return { idToken: response.data.idToken }
    } catch {
      return null
    }
  }, [])

  return { signIn }
}
```

### Existing: `hooks/useAppleSignIn.ts`

```ts
import * as AppleAuthentication from "expo-apple-authentication"
import { useCallback } from "react"
import { Platform } from "react-native"

export function useAppleSignIn() {
  const signIn = useCallback(async (): Promise<{ identityToken: string } | null> => {
    if (Platform.OS !== "ios") return null
    const isAvailable = await AppleAuthentication.isAvailableAsync()
    if (!isAvailable) return null
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })
      if (!credential.identityToken) return null
      return { identityToken: credential.identityToken }
    } catch {
      return null
    }
  }, [])

  return { signIn }
}
```

### TODO: Create `hooks/useFacebookSignIn.ts`

Use the `react-native-fbsdk-next` package (install it: `npx expo install react-native-fbsdk-next`). The hook should:

- Call `LoginManager.logInWithPermissions(["public_profile", "email"])`.
- On success, call `AccessToken.getCurrentAccessToken()` to get the `accessToken`.
- Return `{ accessToken: string } | null`, following the same pattern as the other hooks.
- Wrap in try/catch, return `null` on cancel or error.
- No platform gate needed (Facebook Login works on both iOS and Android).

---

## LAYER 2 -- Screens

### Existing: `app/log-in.tsx` (SSO section only)

```tsx
import { useAppleSignIn } from "@/hooks/useAppleSignIn"
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn"

const googleLogo = require("@/assets/images/google.png")
const appleLogo = require("@/assets/images/apple.png")

// ... inside the component:
const { signIn: googleSignIn } = useGoogleSignIn()
const { signIn: appleSignIn } = useAppleSignIn()
const [isGoogleLoading, setIsGoogleLoading] = useState(false)
const [isAppleLoading, setIsAppleLoading] = useState(false)

// ... in JSX, after the "or" divider:
<Button
  tx="registerOptionsScreen:optionGoogle"
  preset="default"
  style={$tapButton}
  LeftAccessory={GoogleLogoAccessory}
  onPress={async () => {
    if (isGoogleLoading) return
    setIsGoogleLoading(true)
    const credential = await googleSignIn()
    if (credential) {
      const success = await loginWithGoogle(credential.idToken)
      if (success) router.replace("/(logged-in)/(tabs)/cookbooks")
    }
    setIsGoogleLoading(false)
  }}
  disabled={isGoogleLoading}
/>

{Platform.OS === "ios" && (
  <Button
    tx="registerOptionsScreen:optionApple"
    preset="default"
    style={$tapButton}
    LeftAccessory={AppleLogoAccessory}
    onPress={async () => {
      if (isAppleLoading) return
      setIsAppleLoading(true)
      const credential = await appleSignIn()
      if (credential) {
        const success = await loginWithApple(credential.identityToken)
        if (success) router.replace("/(logged-in)/(tabs)/cookbooks")
      }
      setIsAppleLoading(false)
    }}
    disabled={isAppleLoading}
  />
)}
```

### Existing: `app/register-options.tsx` (SSO section only)

```tsx
import { useAppleSignIn } from "@/hooks/useAppleSignIn"
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn"

const appleLogo = require("@/assets/images/apple.png")
const googleLogo = require("@/assets/images/google.png")

// ... inside the component:
const { signIn: googleSignIn } = useGoogleSignIn()
const { signIn: appleSignIn } = useAppleSignIn()
const [isGoogleLoading, setIsGoogleLoading] = useState(false)
const [isAppleLoading, setIsAppleLoading] = useState(false)

// ... in JSX:
{Platform.OS === "ios" && (
  <OptionListItem
    title={t("registerOptionsScreen:optionApple")}
    description={t("registerOptionsScreen:optionAppleDesc")}
    leftImage={appleLogo}
    onPress={async () => {
      if (isAppleLoading) return
      setIsAppleLoading(true)
      const credential = await appleSignIn()
      if (credential) {
        const success = await authenticationStore.loginWithApple(credential.identityToken)
        if (success) router.replace("/(logged-in)/(tabs)/cookbooks")
      }
      setIsAppleLoading(false)
    }}
  />
)}
<OptionListItem
  title={t("registerOptionsScreen:optionGoogle")}
  description={t("registerOptionsScreen:optionGoogleDesc")}
  leftImage={googleLogo}
  onPress={async () => {
    if (isGoogleLoading) return
    setIsGoogleLoading(true)
    const credential = await googleSignIn()
    if (credential) {
      const success = await authenticationStore.loginWithGoogle(credential.idToken)
      if (success) router.replace("/(logged-in)/(tabs)/cookbooks")
    }
    setIsGoogleLoading(false)
  }}
/>
```

### TODO: Modify both screens

In **`app/log-in.tsx`**:

- Import `useFacebookSignIn` and the Facebook logo (`assets/images/facebook.png` already exists).
- Add `FacebookLogoAccessory` (same pattern as `GoogleLogoAccessory`).
- Add `isFacebookLoading` state.
- Destructure `loginWithFacebook` from the auth store.
- Add a Facebook `<Button>` after the Google button (before the Apple button). It should NOT be platform-gated.
- The button's `tx` should be `"registerOptionsScreen:optionFacebook"`.

In **`app/register-options.tsx`**:

- Import `useFacebookSignIn` and the Facebook logo.
- Add `isFacebookLoading` state.
- Add an `<OptionListItem>` for Facebook after Google. It should NOT be platform-gated.
- Use translation keys `registerOptionsScreen:optionFacebook` and `registerOptionsScreen:optionFacebookDesc`.

---

## LAYER 3 -- i18n

### Existing: `i18n/en.ts` (registerOptionsScreen section)

```ts
registerOptionsScreen: {
  title: "Create account",
  optionEmail: "Continue with email",
  optionEmailDesc: "Sign up using your email address",
  optionApple: "Continue with Apple",
  optionAppleDesc: "Sign up with your Apple ID",
  optionGoogle: "Continue with Google",
  optionGoogleDesc: "Sign up with your Google account",
},
```

### TODO: Add Facebook keys to all locale files

Add to `i18n/en.ts`:
```ts
optionFacebook: "Continue with Facebook",
optionFacebookDesc: "Sign up with your Facebook account",
```

Add the same keys (prefixed with `___` per this project's convention for untranslated strings) to `i18n/fr.ts` and `i18n/ko.ts`.

---

## LAYER 4 -- MobX Authentication Store

### Existing: `models/AuthenticationStore.ts` (SSO actions only)

```ts
loginWithGoogle: flow(function* (idToken: string) {
  store.setProp("result", "")
  const response = yield api.loginWithGoogle(idToken)
  if (response.kind !== "ok") {
    store.setProp("result", "Sign in with Google failed. Please try again.")
    console.error(`Error logging in with Google: ${JSON.stringify(response)}`)
    return false
  }
  store.setProp("authResult", AuthResultModel.create(response.authResult))
  store.setProp("authToken", response.authResult.accessToken)
  yield SecureStore.setItemAsync("accessToken", response.authResult.accessToken)
  yield SecureStore.setItemAsync("refreshToken", response.authResult.refreshToken)
  return true
}),
loginWithApple: flow(function* (identityToken: string) {
  store.setProp("result", "")
  const response = yield api.loginWithApple(identityToken)
  if (response.kind !== "ok") {
    store.setProp("result", "Sign in with Apple failed. Please try again.")
    console.error(`Error logging in with Apple: ${JSON.stringify(response)}`)
    return false
  }
  store.setProp("authResult", AuthResultModel.create(response.authResult))
  store.setProp("authToken", response.authResult.accessToken)
  yield SecureStore.setItemAsync("accessToken", response.authResult.accessToken)
  yield SecureStore.setItemAsync("refreshToken", response.authResult.refreshToken)
  return true
}),
```

### TODO: Add `loginWithFacebook` action

Add a `loginWithFacebook` action immediately after `loginWithApple`, following the identical pattern. It should:

- Accept `accessToken: string` as its parameter.
- Call `api.loginWithFacebook(accessToken)`.
- Set result to `"Sign in with Facebook failed. Please try again."` on failure.
- Log `"Error logging in with Facebook: ..."` on failure.

---

## LAYER 5 -- API Service

### Existing: `services/api/wrappers/users.ts` (SSO functions only)

```ts
export async function loginWithGoogle(
  idToken: string,
): Promise<ApiResult<{ authResult: AuthResultSnapshotIn }>> {
  try {
    const { data, error, response } = await client.POST("/api/Users/login-google", {
      body: { idToken },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "bad-data" }
    const { tokenType, accessToken, expiresIn, refreshToken } = data
    if (!tokenType || !accessToken || !expiresIn || !refreshToken) return { kind: "bad-data" }
    return toOkResult({
      authResult: { tokenType, accessToken, expiresIn, refreshToken },
    })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function loginWithApple(
  identityToken: string,
): Promise<ApiResult<{ authResult: AuthResultSnapshotIn }>> {
  try {
    const { data, error, response } = await client.POST("/api/Users/login-apple", {
      body: { identityToken },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "bad-data" }
    const { tokenType, accessToken, expiresIn, refreshToken } = data
    if (!tokenType || !accessToken || !expiresIn || !refreshToken) return { kind: "bad-data" }
    return toOkResult({
      authResult: { tokenType, accessToken, expiresIn, refreshToken },
    })
  } catch (e) {
    return toProblemFromError(e)
  }
}
```

### Existing: `services/api/index.ts` (SSO methods only)

```ts
async loginWithGoogle(
  idToken: string,
): Promise<{ kind: "ok"; authResult: AuthResultSnapshotIn } | GeneralApiProblem> {
  return userWrappers.loginWithGoogle(idToken)
}

async loginWithApple(
  identityToken: string,
): Promise<{ kind: "ok"; authResult: AuthResultSnapshotIn } | GeneralApiProblem> {
  return userWrappers.loginWithApple(identityToken)
}
```

### TODO: Add Facebook to both files

In **`services/api/wrappers/users.ts`**, add a `loginWithFacebook` function that:

- Accepts `accessToken: string`.
- POSTs to `"/api/Users/login-facebook"` with body `{ accessToken }`.
- Follows the identical response-handling pattern.

In **`services/api/index.ts`**, add a `loginWithFacebook` method on the `Api` class that delegates to `userWrappers.loginWithFacebook`.

---

## LAYER 6 -- Backend Endpoint

### Existing: `SharedCookbook/src/Web/Endpoints/Users.cs`

```csharp
using Microsoft.AspNetCore.Identity;
using SharedCookbook.Application.Users.Commands.LoginWithApple;
using SharedCookbook.Application.Users.Commands.LoginWithGoogle;
using SharedCookbook.Application.Users.Commands.UpdateUser;
using SharedCookbook.Application.Users.Queries;
using SharedCookbook.Infrastructure.Identity;

namespace SharedCookbook.Web.Endpoints;

public class Users : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder builder)
    {
        builder.MapPost(Update, pattern: "/update");
        builder.MapGet(GetDisplayName, pattern: "/display-name");
        builder.MapPost(LoginGoogle, pattern: "/login-google");
        builder.MapPost(LoginApple, pattern: "/login-apple");
        builder.MapIdentityApi<ApplicationUser>();
    }

    private static async Task<IResult> LoginGoogle(ISender sender, [FromBody] LoginWithGoogleCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded
            ? Results.SignIn(result.Value!, authenticationScheme: IdentityConstants.BearerScheme)
            : Results.Unauthorized();
    }

    private static async Task<IResult> LoginApple(ISender sender, [FromBody] LoginWithAppleCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded
            ? Results.SignIn(result.Value!, authenticationScheme: IdentityConstants.BearerScheme)
            : Results.Unauthorized();
    }

    private static async Task<IResult> Update(ISender sender, [FromBody] UpdateUserCommand command)
    {
        await sender.Send(command);
        return Results.NoContent();
    }

    private static Task<DisplayNameDto> GetDisplayName(ISender sender) => sender.Send(new GetDisplayNameQuery());
}
```

### TODO: Add Facebook endpoint

- Add `using SharedCookbook.Application.Users.Commands.LoginWithFacebook;`
- Add `builder.MapPost(LoginFacebook, pattern: "/login-facebook");` in `Map()`.
- Add `LoginFacebook` method following the identical pattern as `LoginGoogle`/`LoginApple`, accepting `LoginWithFacebookCommand`.

---

## LAYER 7 -- Backend MediatR Command

### Existing: `SharedCookbook/src/Application/Users/Commands/LoginWithGoogle/LoginWithGoogle.cs`

```csharp
using SharedCookbook.Application.Common.Models;
using SharedCookbook.Application.Common.Security;

namespace SharedCookbook.Application.Users.Commands.LoginWithGoogle;

[AllowAnonymous]
public record LoginWithGoogleCommand(string IdToken) : IRequest<Result<System.Security.Claims.ClaimsPrincipal>>;

public class LoginWithGoogleCommandHandler(
    IExternalLoginService externalLoginService,
    ISignInPrincipalFactory signInPrincipalFactory)
    : IRequestHandler<LoginWithGoogleCommand, Result<System.Security.Claims.ClaimsPrincipal>>
{
    public async Task<Result<System.Security.Claims.ClaimsPrincipal>> Handle(
        LoginWithGoogleCommand request,
        CancellationToken cancellationToken)
    {
        var loginResult = await externalLoginService.LoginWithGoogleAsync(request.IdToken, cancellationToken);
        if (!loginResult.Succeeded)
            return Result<System.Security.Claims.ClaimsPrincipal>.Failure(loginResult.Errors);

        var principal = await signInPrincipalFactory.CreatePrincipalForUserIdAsync(loginResult.Value!, cancellationToken);
        if (principal == null)
            return Result<System.Security.Claims.ClaimsPrincipal>.Failure(["User not found."]);

        return Result<System.Security.Claims.ClaimsPrincipal>.Success(principal);
    }
}
```

### TODO: Create `SharedCookbook/src/Application/Users/Commands/LoginWithFacebook/LoginWithFacebook.cs`

- Create the directory `LoginWithFacebook/` under `Application/Users/Commands/`.
- The command record should be: `LoginWithFacebookCommand(string AccessToken)`.
- The handler calls `externalLoginService.LoginWithFacebookAsync(request.AccessToken, cancellationToken)`.
- Everything else is identical to the Google/Apple handlers.

---

## LAYER 8 -- Backend Interface

### Existing: `SharedCookbook/src/Application/Common/Interfaces/IExternalLoginService.cs`

```csharp
using SharedCookbook.Application.Common.Models;

namespace SharedCookbook.Application.Common.Interfaces;

public interface IExternalLoginService
{
    Task<Result<string>> LoginWithGoogleAsync(string idToken, CancellationToken cancellationToken);
    Task<Result<string>> LoginWithAppleAsync(string identityToken, CancellationToken cancellationToken);
}
```

### TODO: Add Facebook method to the interface

Add:
```csharp
Task<Result<string>> LoginWithFacebookAsync(string accessToken, CancellationToken cancellationToken);
```

---

## LAYER 9 -- Backend Token Verification Service

### Existing: `SharedCookbook/src/Infrastructure/Identity/ExternalLoginService.cs`

```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using SharedCookbook.Application.Common.Interfaces;
using SharedCookbook.Application.Common.Models;

namespace SharedCookbook.Infrastructure.Identity;

public class ExternalLoginService(
    UserManager<ApplicationUser> userManager,
    IOptions<GoogleAuthOptions> googleOptions,
    IOptions<AppleAuthOptions> appleOptions,
    ILogger<ExternalLoginService> logger)
    : IExternalLoginService
{
    private const string GoogleLoginProvider = "Google";
    private const string AppleLoginProvider = "Apple";
    private const string AppleIssuer = "https://appleid.apple.com";

    private readonly string _googleClientId = googleOptions.Value.ClientId
        ?? throw new InvalidOperationException("Authentication:Google:ClientId must be configured.");

    private readonly string _appleBundleId = appleOptions.Value.BundleId
        ?? throw new InvalidOperationException("Authentication:Apple:BundleId must be configured.");

    private static readonly ConfigurationManager<OpenIdConnectConfiguration> AppleConfigManager = new(
        "https://appleid.apple.com/.well-known/openid-configuration",
        new OpenIdConnectConfigurationRetriever(),
        new HttpDocumentRetriever());

    public async Task<Result<string>> LoginWithGoogleAsync(string idToken, CancellationToken cancellationToken)
    {
        // ... validates Google token via GoogleJsonWebSignature.ValidateAsync ...
        // ... extracts email and subject from payload ...
        return await FindOrCreateUserAsync(GoogleLoginProvider, subject, email);
    }

    public async Task<Result<string>> LoginWithAppleAsync(string identityToken, CancellationToken cancellationToken)
    {
        // ... validates Apple token via JwtSecurityTokenHandler against Apple OIDC config ...
        // ... extracts email and subject from ClaimsPrincipal ...
        return await FindOrCreateUserAsync(AppleLoginProvider, subject, email);
    }

    private async Task<Result<string>> FindOrCreateUserAsync(string loginProvider, string subject, string email)
    {
        // Looks up user by external login, then by email, or creates new user.
        // Links external login info. Returns user ID on success.
    }
}
```

### TODO: Add Facebook token verification

Modify `ExternalLoginService`:

1. **Constructor**: Add `IOptions<FacebookAuthOptions> facebookOptions` parameter and `IHttpClientFactory httpClientFactory` parameter.
2. **Fields**: Add `private const string FacebookLoginProvider = "Facebook";` and store the App ID and App Secret from `FacebookAuthOptions`.
3. **Implement `LoginWithFacebookAsync`**:
   - Facebook does NOT use JWTs. Instead, verify the access token by calling the Facebook Graph API debug endpoint:
     ```
     GET https://graph.facebook.com/debug_token?input_token={accessToken}&access_token={appId}|{appSecret}
     ```
   - Parse the JSON response. Check that `data.is_valid` is `true` and `data.app_id` matches your App ID.
   - Then fetch the user's profile:
     ```
     GET https://graph.facebook.com/me?fields=id,email&access_token={accessToken}
     ```
   - Extract `id` (use as `subject`) and `email` from the response.
   - Call `FindOrCreateUserAsync(FacebookLoginProvider, subject, email)`.
   - Handle errors (invalid token, missing email) with the same logging/result pattern as Google/Apple.
4. Use `HttpClient` from `IHttpClientFactory` (register a named client `"Facebook"` in DI) instead of creating raw `HttpClient` instances.

---

## LAYER 10 -- Backend Configuration

### Existing: `SharedCookbook/src/Infrastructure/Identity/GoogleAuthOptions.cs`

```csharp
namespace SharedCookbook.Infrastructure.Identity;

public class GoogleAuthOptions
{
    public const string SectionName = "Authentication:Google";
    public string? ClientId { get; set; }
}
```

### TODO: Create `SharedCookbook/src/Infrastructure/Identity/FacebookAuthOptions.cs`

```csharp
namespace SharedCookbook.Infrastructure.Identity;

public class FacebookAuthOptions
{
    public const string SectionName = "Authentication:Facebook";
    public string? AppId { get; set; }
    public string? AppSecret { get; set; }
}
```

### TODO: Update `SharedCookbook/src/Infrastructure/DependencyInjection.cs`

Add after the Apple options registration:

```csharp
builder.Services.Configure<FacebookAuthOptions>(
    builder.Configuration.GetSection(FacebookAuthOptions.SectionName));
builder.Services.AddHttpClient("Facebook");
```

### TODO: Update `SharedCookbook/src/Web/appsettings.json`

Add to the `Authentication` section:

```json
"Facebook": {
  "AppId": "",
  "AppSecret": ""
}
```

### TODO: Update `SharedCookbook/src/Web/appsettings.Development.json`

Add to the `Authentication` section:

```json
"Facebook": {
  "AppId": "<your-facebook-app-id>",
  "AppSecret": "<your-facebook-app-secret>"
}
```

---

## LAYER 11 -- OpenAPI Schema (if auto-generated)

If the project uses an OpenAPI spec that is auto-generated from the backend endpoints, regenerate it after adding the `/login-facebook` endpoint so the typed client on the mobile side picks up the new route. The mobile API wrapper uses `client.POST("/api/Users/login-facebook", ...)` which relies on the schema being up to date.

---

## Summary Checklist

### New files to create:
- `cookbook-mobile/hooks/useFacebookSignIn.ts`
- `SharedCookbook/src/Application/Users/Commands/LoginWithFacebook/LoginWithFacebook.cs`
- `SharedCookbook/src/Infrastructure/Identity/FacebookAuthOptions.cs`

### Existing files to modify:

**Mobile (`cookbook-mobile/`):**
- `app/log-in.tsx` -- add Facebook button, hook, loading state
- `app/register-options.tsx` -- add Facebook option list item, hook, loading state
- `models/AuthenticationStore.ts` -- add `loginWithFacebook` action
- `services/api/wrappers/users.ts` -- add `loginWithFacebook` function
- `services/api/index.ts` -- add `loginWithFacebook` method
- `i18n/en.ts` -- add `optionFacebook` and `optionFacebookDesc`
- `i18n/fr.ts` -- add `___`-prefixed Facebook keys
- `i18n/ko.ts` -- add `___`-prefixed Facebook keys

**Backend (`SharedCookbook/src/`):**
- `Application/Common/Interfaces/IExternalLoginService.cs` -- add `LoginWithFacebookAsync`
- `Infrastructure/Identity/ExternalLoginService.cs` -- implement `LoginWithFacebookAsync`, add constructor params
- `Infrastructure/DependencyInjection.cs` -- register `FacebookAuthOptions` and `HttpClient`
- `Web/Endpoints/Users.cs` -- add `/login-facebook` route and handler
- `Web/appsettings.json` -- add Facebook config section
- `Web/appsettings.Development.json` -- add Facebook config with dev values

### Asset:
- `assets/images/facebook.png` already exists in the repo.

### Package to install:
- `react-native-fbsdk-next` in the mobile project (follow its setup guide for `app.json`/`app.config.ts` Expo config plugin if using Expo managed workflow, or native linking if bare).

### Facebook Developer Console setup (not code, but required):
- Create a Facebook App at https://developers.facebook.com/
- Enable "Facebook Login" product.
- Add iOS and Android platform configs (bundle ID, package name, key hashes).
- Note the App ID and App Secret for backend config.
