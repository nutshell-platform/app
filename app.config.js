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
    "version": "1.0.0",

    // Visual
    "orientation": "default",
    "icon": "./assets/icon/acorn_drop_appStore.png",
    "splash": {
      "image": "./assets/icon/acorn_drop_appStore.png",
      "resizeMode": "contain",
      "backgroundColor": "#808080"
    },
    "notification": {
      icon: './assets/icon/acorn_drop_vector_greyscale_94_94.png'
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
      "buildNumber": "1.1.1",
      "infoPlist": {
        NSCameraUsageDescription: "Camera permission is used to take a new photo to use as your profile picture.",
        NSPhotoLibraryUsageDescription: "Photo library permission is used to select an existing photo on your device as a profile picture."
      }
    },

    // Android config
    "android": {
      "package": "com.nutshell.nutshell",
      "googleServicesFile": "./google-services.json",
      "versionCode": 3,
      "permissions": []
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
