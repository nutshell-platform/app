import { Platform } from 'react-native'
import Constants from 'expo-constants'
const { manifest } = Constants

export const isWeb = Platform.OS == 'web'
export const isIos = Platform.OS == 'ios'
export const isAndroid = Platform.OS == 'android'
export const dev = process.env.NODE_ENV == 'development' || location?.href.includes( 'debug=true' )

const { version: appVersion, revisionId } = manifest
export const version = `${ appVersion || '' } ${ revisionId ? `- ${ revisionId }` : '' }`

export { Platform } from 'react-native'