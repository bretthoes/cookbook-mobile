# Cookbook-Mobile

Mobile app built using React Native that allows users to create and join shared cookbooks, as well as upload and manage recipes.

## Run Locally

To run the app locally, follow these steps:

1. Ensure you have [Expo](https://expo.dev/) installed.
2. Install [Android Studio](https://developer.android.com/studio) and set it up for React Native development.
3. Clone this repository and navigate to its root directory.
4. Update the development configuration file (`\app\config\config.dev.ts`). Set the `API_URL` value to the URL of a running instance of [SharedCookbook API](https://github.com/bretthoes/SharedCookbook).
5. Install dependencies by running:

```bash
yarn install
```

6. Run the app on Android using:

```bash
yarn android
```

## Troubleshooting
- If you run into issues accessing the local API from a mobile device emulator, try using a tunneling service like [ngrok](https://ngrok.com/) to make the local URL publicly accessible, and point to this base URL instead for Step 4 above.

## Acknowledgement

This project is based on the Ignite boilerplate from the [Ignite Boilerplate Repository](https://github.com/infinitered/ignite).
