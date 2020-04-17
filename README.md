# Expo boilerplate

Boilerplate is compatible with android, ios and web.

## Requirements

- Node.js version 12 (use [nvm](https://github.com/nvm-sh/nvm))
- [Expo client]( https://expo.io/tools )

## Usage

- Clone this repo
- Install dependencies with `npm i`
- Install `npm i -g expo-cli`
- Log into expo with `expo login`
- Start with `npm run android/ios/web`.

To preview app on phone, use the Expo app.

Testing: `npm test` based on Jest.

## To implement

Based on your app you will have to edit:

- `modules/push.js` to implement `savePushToken` based on your needs

## While developing

- `npm run refresh` to kill expo client through adb on Android
- `npm run stage` to deploy to staging channel

## Environment variables

Environment variables in `.env` file are mandatory. Empty strings are allowed (and disable the service). You may use a separate `.env.production`. There is an overview of variables in the `.env.example` file.