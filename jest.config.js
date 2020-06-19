const transformers = {
      "^.+\\.jsx?$": "babel-jest",
      "^.+\\.js?$": "babel-jest",
      "^.+\\.svg$": "jest-svg-transformer"
    }
const expoTransforms = "node_modules/(?!(jest-)?react-native|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@neverdull-agency/expo-unlimited-secure-store)"
const customTransforms = "(?!react-router|@neverdull-agency)"

// Mocks
const mockNotificationModule = '<rootDir>/_test/_mock_expo_notification.js'
const mockNativAnimationDriver = '<rootDir>/_test/_mock_animation_driver.js'
const mockTimers = '<rootDir>/_test/_mock_timers.js'
const mockSvgs = { "\\.svg": "<rootDir>/_test/_mock_svg.js" }
const webMocks = '<rootDir>/_test/_mocks_web.js'
module.exports = {
	"projects": [
		{ "preset": "jest-expo/ios", transform: transformers, "transformIgnorePatterns": [ `${expoTransforms}${customTransforms}` ], setupFiles: [ mockNativAnimationDriver, mockTimers] },
		{ "preset": "jest-expo/android", transform: transformers, "transformIgnorePatterns": [ `${expoTransforms}${customTransforms}` ], setupFiles: [ mockNativAnimationDriver, mockTimers ] },
		{ "preset": "jest-expo/web", transform: transformers, "transformIgnorePatterns": [ `${expoTransforms}${customTransforms}` ], setupFiles: [ mockNotificationModule, mockNativAnimationDriver, mockTimers], moduleNameMapper: { ...mockSvgs } }
	]
}