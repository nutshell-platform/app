import { Platform, Appearance } from 'react-native'
import Constants from 'expo-constants'
const { manifest } = Constants

// What are we running on?
export const isWeb = Platform.OS == 'web'
export const isIos = Platform.OS == 'ios'
export const isAndroid = Platform.OS == 'android'
export const OS = Platform.OS
export const dev = process.env.NODE_ENV == 'development' || ( isWeb && typeof location !== 'undefined' && location.href.includes( 'debug=true' ) )
export const isCI = typeof jest != 'undefined'

// What are we running?
const { version: appVersion, revisionId } = manifest
export const version = revisionId || 'development'

// What are we running like?
export const getIsDarkMode = f => Appearance.getColorScheme() == 'dark'

export { Platform } from 'react-native'
