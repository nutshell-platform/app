// Firebase configs
require('dotenv').config()

const { FIREBASE_apiKey, FIREBASE_authDomain, FIREBASE_databaseURL, FIREBASE_projectId, FIREBASE_storageBucket, FIREBASE_messagingSenderId, FIREBASE_appId, FIREBASE_measurementId } = process.env
const { development: dev } = process.env
const firebaseConfig = {
  apiKey: FIREBASE_apiKey,
  authDomain: FIREBASE_authDomain,
  databaseURL: FIREBASE_databaseURL,
  projectId: FIREBASE_projectId,
  storageBucket: FIREBASE_storageBucket,
  messagingSenderId: FIREBASE_messagingSenderId,
  appId: FIREBASE_appId,
  measurementId: FIREBASE_measurementId
}

export default {
  "expo": {

    // Publically visible
    "name": "Nutshell - Slowcial Network",
    "description": "One message a week from people you care about",

    // Settings
    "slug": "nutshell-platform",
    "privacy": "public",
    "platforms": [
      "ios",
      "android",
      "web"
    ],
    "version": "1.1.0",

    // Visual
    "orientation": "default",
    "icon": "./assets/icon/acorn_drop_appStore.png",
    "splash": {
      "image": "./assets/icon/acorn_bg_appStore.png",
      "resizeMode": "contain",
      "backgroundColor": "#808080"
    },
    "notification": {
      icon: './assets/icon/acorn_drop_vector_greyscale_94_94.png',
      color: '#000000',
      iosDisplayInForeground: true,
      androidMode: 'default'
    },

    // App settings
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "scheme": "com.nutshell.nutshell",

    // IOS config
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.nutshell.nutshell",
      "googleServicesFile": `./GoogleService-Info${ dev ? '-development' : '' }.plist`,
      "buildNumber": "1.2.1",
      "infoPlist": {
        NSCameraUsageDescription: "Camera permission is used to take a new photo to use as your profile picture.",
        NSPhotoLibraryUsageDescription: "Photo library permission is used to select an existing photo on your device as a profile picture.",
        NSContactsUsageDescription: "Contact book permission is used to find your friends on the platform, you will need to trigger this action manually. Your contacts are never accessed without your consent."
      }
    },

    // Android config
    "android": {
      "package": "com.nutshell.nutshell",
      "googleServicesFile": `./google-services${ dev ? '-development' : '' }.json`,
      "versionCode": 5,
      "permissions": [ "CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE", "READ_CONTACTS" ]
    },

    // Web config
    web: {
      firebase: firebaseConfig
    },


    // Sentry config
    "hooks": {
      "postPublish": [
        {
          "file": "sentry-expo/upload-sourcemaps"
        }
      ]
    },

    // Metro config
    "packagerOpts": {
      "config": "metro.config.js",
      "sourceExts": [
        "expo.ts",
        "expo.tsx",
        "expo.js",
        "expo.jsx",
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "wasm",
        "svg"
      ]
    }
  }
}
