# Cookbook-Mobile

Mobile app built using React Native that allows users to create and join shared cookbooks, as well as upload and manage recipes.

## Run Locally

To run the app locally, follow these steps:

1. Ensure you have [Expo](https://expo.dev/) installed.
2. Install [Android Studio](https://developer.android.com/studio) and set it up for React Native development.
3. Clone this repository and navigate to its root directory.
4. Update the development configuration file (`dev.config.js`) with the URL of the running SharedCookbook API.
5. Install dependencies by running:

```bash
yarn install
```

6. Run the app on Android using:

```bash
yarn android
```

## Acknowledgement

This project is based on the Ignite boilerplate from the [Ignite Boilerplate Repository](https://github.com/infinitered/ignite).

The Ignite boilerplate project's structure will look similar to this:

```
ignite-project
├── app
│   ├── components
│   ├── config
│   ├── i18n
│   ├── models
│   ├── navigators
│   ├── screens
│   ├── services
│   ├── theme
│   ├── utils
│   └── app.tsx
├── assets
│   ├── icons
│   └── images
├── test
│   ├── __snapshots__
│   ├── mockFile.ts
│   └── setup.ts
├── README.md
├── android
│   ├── app
│   ├── build.gradle
│   ├── gradle
│   ├── gradle.properties
│   ├── gradlew
│   ├── gradlew.bat
│   ├── keystores
│   └── settings.gradle
├── ignite
│   └── templates
|       |── app-icon
│       ├── component
│       ├── model
│       ├── navigator
│       └── screen
├── index.js
├── ios
│   ├── IgniteProject
│   ├── IgniteProject-tvOS
│   ├── IgniteProject-tvOSTests
│   ├── IgniteProject.xcodeproj
│   └── IgniteProjectTests
├── .env
└── package.json

```
