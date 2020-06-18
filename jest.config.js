const transformers = {
      "^.+\\.jsx?$": "babel-jest",
      "^.+\\.js?$": "babel-jest",
      "^.+\\.svg$": "jest-svg-transformer"
    }
const expoTransforms = "node_modules/(?!(jest-)?react-native|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@neverdull-agency/expo-unlimited-secure-store)"
const customTransforms = "(?!react-router|@neverdull-agency)"
const mockNotificationModule = '<rootDir>/_test/_mock_expo_notification.js'
const mockSvgs = {
	"\\.svg": "<rootDir>/_test/_mock_svg.js"
}
module.exports = {
	"projects": [
		{ "preset": "jest-expo/ios", transform: transformers, "transformIgnorePatterns": [ `${expoTransforms}${customTransforms}` ] },
		{ "preset": "jest-expo/android", transform: transformers, "transformIgnorePatterns": [ `${expoTransforms}${customTransforms}` ] },
		{ "preset": "jest-expo/web", transform: transformers, "transformIgnorePatterns": [ `${expoTransforms}${customTransforms}` ], setupFilesAfterEnv: [ mockNotificationModule ], moduleNameMapper: { ...mockSvgs } }
	]
}