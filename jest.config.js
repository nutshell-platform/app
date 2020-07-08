const transformers = {
      "^.+\\.jsx?$": "babel-jest",
      "^.+\\.js?$": "babel-jest",
      "^.+\\.svg$": "jest-svg-transformer"
    }
const expoTransforms = "node_modules/(?!(jest-)?react-native|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@neverdull-agency/expo-unlimited-secure-store)"
const customTransforms = "(?!react-router|@neverdull-agency)"

// Mocks
const mockNativAnimationDriver = '<rootDir>/_test/_mock_animation_driver.js'
const mockTimers = '<rootDir>/_test/_mock_timers.js'
const mockSvgs = { "\\.svg": "<rootDir>/_test/_mock_svg.js" }
const firebaseMock = '<rootDir>/_test/_mock_firebase.js'
const webMocks = '<rootDir>/_test/_mocks_web.js'

// Error handling
const handleUnhandlesRejections = '<rootDir>/_test/_handle_unhandled_rejections.js'
const handleAsyncQueue = '<rootDir>/_test/_handle-async-queue.js'

const universalSetup = [ mockNativAnimationDriver, mockTimers, handleUnhandlesRejections, firebaseMock, handleAsyncQueue ]

module.exports = {
	testPathIgnorePatterns: ['lib/', 'node_modules/'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testEnvironment: 'node',
	"projects": [
		{
			"preset": "jest-expo/ios",
			clearMocks: true,
			transform: transformers,
			"transformIgnorePatterns": [ `${expoTransforms}${customTransforms}` ],
			setupFilesAfterEnv: universalSetup
		},
		{
			"preset": "jest-expo/android",
			clearMocks: true,
			transform: transformers,
			"transformIgnorePatterns": [ `${expoTransforms}${customTransforms}` ],
			setupFilesAfterEnv: universalSetup
		},
		{
			"preset": "jest-expo/web",
			clearMocks: true,
			transform: transformers,
			"transformIgnorePatterns": [ `${expoTransforms}${customTransforms}` ],
			setupFilesAfterEnv: [ webMocks,...universalSetup ],
			moduleNameMapper: { ...mockSvgs }
		}
	]
}