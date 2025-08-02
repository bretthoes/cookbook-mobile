import demoEn from "./demo-en"

const en = {
  common: {
    ok: "OK!",
    cancel: "Cancel",
    back: "Back",
    logOut: "Log Out",
  },
  welcomeScreen: {
    postscript:
      "psst  — This probably isn't what your app looks like. (Unless your designer handed you these screens, and in that case, ship it!)",
    readyForLaunch: "Your app, almost ready for launch!",
    exciting: "(ohh, this is exciting!)",
    letsGo: "Let's go!",
  },
  errorScreen: {
    title: "Something went wrong!",
    friendlySubtitle:
      "This is the screen that your users will see in production when an error is thrown. You'll want to customize this message (located in `app/i18n/en.ts`) and probably the layout as well (`app/screens/ErrorScreen`). If you want to remove this entirely, check `app/app.tsx` for the <ErrorBoundary> component.",
    reset: "RESET APP",
    traceTitle: "Error from %{name} stack",
  },
  emptyStateComponent: {
    generic: {
      heading: "Looks like it's empty here",
      content: "No data found yet. Try clicking the button to refresh or reload the app.",
      button: "Let's try this again",
    },
  },
  errors: {
    invalidEmail: "Invalid email address.",
  },
  loginScreen: {
    logIn: "Log In",
    signIn: "Sign In",
    enterDetails:
      "Enter your details below to get started. Save your favorite recipes with your family and friends.",
    emailFieldLabel: "Email",
    passwordFieldLabel: "Password",
    passwordForgot: "Forgot Password?",
    emailFieldPlaceholder: "Enter your email address",
    passwordFieldPlaceholder: "Super secret password here",
    tapToLogIn: "Tap to log in!",
    tapToSignIn: "Tap to sign in!",
    hint: "Hint: you can use any email address and your favorite password :)",
    register: "No account? Register",
  },
  demoNavigator: {
    componentsTab: "Components",
    debugTab: "Debug",
    createTab: "Create",
    communityTab: "Community",
    podcastListTab: "Podcast",
    cookbookListTab: "Cookbooks",
    profileTab: "Profile",
  },
  demoCommunityScreen: {
    title: "Connect with the community",
    tagLine:
      "Plug in to Infinite Red's community of React Native engineers and level up your app development with us!",
    joinUsOnSlackTitle: "Join us on Slack",
    joinUsOnSlack:
      "Wish there was a place to connect with React Native engineers around the world? Join the conversation in the Infinite Red Community Slack! Our growing community is a safe space to ask questions, learn from others, and grow your network.",
    joinSlackLink: "Join the Slack Community",
    makeIgniteEvenBetterTitle: "Make Ignite even better",
    makeIgniteEvenBetter:
      "Have an idea to make Ignite even better? We're happy to hear that! We're always looking for others who want to help us build the best React Native tooling out there. Join us over on GitHub to join us in building the future of Ignite.",
    contributeToIgniteLink: "Contribute to Ignite",
    theLatestInReactNativeTitle: "The latest in React Native",
    theLatestInReactNative: "We're here to keep you current on all React Native has to offer.",
    reactNativeRadioLink: "React Native Radio",
    reactNativeNewsletterLink: "React Native Newsletter",
    reactNativeLiveLink: "React Native Live",
    chainReactConferenceLink: "Chain React Conference",
    hireUsTitle: "Hire Infinite Red for your next project",
    hireUs:
      "Whether it's running a full project or getting teams up to speed with our hands-on training, Infinite Red can help with just about any React Native project.",
    hireUsLink: "Send us a message",
  },
  demoShowroomScreen: {
    jumpStart: "Components to jump start your project!",
    lorem2Sentences:
      "Nulla cupidatat deserunt amet quis aliquip nostrud do adipisicing. Adipisicing excepteur elit laborum Lorem adipisicing do duis.",
    demoHeaderTxExample: "Yay",
    demoViaTxProp: "Via `tx` Prop",
    demoViaSpecifiedTxProp: "Via `{{prop}}Tx` Prop",
  },
  pendingInvitationScreen: {
    title: "Your invitations",
    subtitle: "These invitations are pending approval.",
    accept: "Accept",
    reject: "Reject",
  },
  demoDebugScreen: {
    howTo: "HOW TO",
    title: "Debug",
    tagLine:
      "Congratulations, you've got a very advanced React Native app template here.  Take advantage of this boilerplate!",
    reactotron: "Send to Reactotron",
    reportBugs: "Report Bugs",
    demoList: "Demo List",
    demoPodcastList: "Demo Podcast List",
    androidReactotronHint:
      "If this doesn't work, ensure the Reactotron desktop app is running, run adb reverse tcp:9090 tcp:9090 from your terminal, and reload the app.",
    iosReactotronHint:
      "If this doesn't work, ensure the Reactotron desktop app is running and reload app.",
    macosReactotronHint:
      "If this doesn't work, ensure the Reactotron desktop app is running and reload app.",
    webReactotronHint:
      "If this doesn't work, ensure the Reactotron desktop app is running and reload app.",
    windowsReactotronHint:
      "If this doesn't work, ensure the Reactotron desktop app is running and reload app.",
  },
  profileScreen: {
    howTo: "HOW TO",
    title: "Profile",
    tagLine:
      "Congratulations, you've got a very advanced React Native app template here.  Take advantage of this boilerplate!",
    reactotron: "Send to Reactotron",
    reportBugs: "Report Bugs",
    demoList: "Demo List",
    demoPodcastList: "Demo Podcast List",
    androidReactotronHint:
      "If this doesn't work, ensure the Reactotron desktop app is running, run adb reverse tcp:9090 tcp:9090 from your terminal, and reload the app.",
    iosReactotronHint:
      "If this doesn't work, ensure the Reactotron desktop app is running and reload app.",
    macosReactotronHint:
      "If this doesn't work, ensure the Reactotron desktop app is running and reload app.",
    webReactotronHint:
      "If this doesn't work, ensure the Reactotron desktop app is running and reload app.",
    windowsReactotronHint:
      "If this doesn't work, ensure the Reactotron desktop app is running and reload app.",
  },
  demoPodcastListScreen: {
    title: "Your shelf",
    onlyFavorites: "Only Show Favorites",
    favoriteButton: "Favorite",
    unfavoriteButton: "Unfavorite",
    accessibility: {
      cardHint:
        "Double tap to listen to the episode. Double tap and hold to {{action}} this episode.",
      switch: "Switch on to only show favorites",
      favoriteAction: "Toggle Favorite",
      favoriteIcon: "Episode not favorited",
      unfavoriteIcon: "Episode favorited",
      publishLabel: "Published {{date}}",
      durationLabel: "Duration: {{hours}} hours {{minutes}} minutes {{seconds}} seconds",
    },
    noFavoritesEmptyState: {
      heading: "This looks a bit empty",
      content:
        "No favorites have been added yet. Tap the heart on an episode to add it to your favorites!",
    },
    invitationListScreen: {
      title: "My Invitations",
      onlyFavorites: "Only Show Favorites",
      favoriteButton: "Favorite",
      unfavoriteButton: "Unfavorite",
      accessibility: {
        cardHint:
          "Double tap to open the cookbook. Double tap and hold to {{action}} this cookbook.",
        switch: "Switch on to only show favorites",
        favoriteAction: "Toggle Favorite",
        favoriteIcon: "Cookbook not favorited",
        unfavoriteIcon: "Cookbook favorited",
        publishLabel: "Published {{date}}",
        durationLabel: "Duration: {{hours}} hours {{minutes}} minutes {{seconds}} seconds",
      },
      noFavoritesEmptyState: {
        heading: "This looks a bit empty",
        content:
          "No favorites have been added yet. Tap the heart on an item to add it to your favorites!",
      },
    },
    cookbookListScreen: {
      title: "My Cookbooks",
      onlyFavorites: "Only Show Favorites",
      favoriteButton: "Favorite",
      unfavoriteButton: "Unfavorite",
      add: "Create new cookbook",
      accessibility: {
        cardHint:
          "Double tap to open the cookbook. Double tap and hold to {{action}} this cookbook.",
        switch: "Switch on to only show favorites",
        favoriteAction: "Toggle Favorite",
        favoriteIcon: "Cookbook not favorited",
        unfavoriteIcon: "Cookbook favorited",
        publishLabel: "Published {{date}}",
        durationLabel: "Duration: {{hours}} hours {{minutes}} minutes {{seconds}} seconds",
      },
      noFavoritesEmptyState: {
        heading: "This looks a bit empty",
        content:
          "No favorites have been added yet. Tap the heart on an item to add it to your favorites!",
      },
      cookbookCard: {
        membersLabel: "{{count}} member",
        membersLabel_plural: "{{count}} members",
        recipesLabel: "{{count}} recipe",
        recipesLabel_plural: "{{count}} recipes",
      },
    },
    recipeDetailsScreen: {
      directions: "Directions",
      ingredients: "Ingredients",
      servings: "Servings",
      cook: "Cook Time",
      prep: "Prep Time",
      bake: "Bake Time",
      summary: "Summary",
      edit: "Edit",
    },
    recipeListScreen: {
      title: "Recipes",
      searchPlaceholder: "Search",
      add: "Create new recipe",
      edit: "Update this recipe",
      invite: "Invite someone else",
      leave: "Leave cookbook",
    },
    recipeAddScreen: {
      title: "Add Recipe",
      titleHelper: "The title for the new recipe",
      titlePlacehoder: "Title",
    },
  },

  createScreen: {
    title: "What do you want to create?",
  },

  // Recipe related translations
  recipeListScreen: {
    title: "Recipes",
    searchPlaceholder: "Search",
    add: "Create new recipe",
    edit: "Update this recipe",
    invite: "Invite someone else",
    leave: "Leave cookbook",
  },
  recipeDetailsScreen: {
    directions: "Directions",
    ingredients: "Ingredients",
    servings: "Servings",
    cook: "Cook Time",
    prep: "Prep Time",
    bake: "Bake Time",
    summary: "Summary",
    edit: "Edit",
  },
  // Settings related translations
  languageScreen: {
    support: "If you would like to request support for a language that is not listed, please use the 'Report Bugs' link in the profile tab.",
    note: "Note: You may need to log out and back in for the changes to take effect."
  },

  ...demoEn,
}

export default en
export type Translations = typeof en
