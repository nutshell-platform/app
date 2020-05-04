import { checkOrRequestPushAccess } from './apis/permissions'
import { isWeb } from './apis/platform'

export const another = true

export const getTokenIfNeeded = async settings => {

	// Exit if web or no notifications enabled
	if( isWeb || !Object.values( settings.notifications ).includes( true ) ) return false

	// Get local push token
	const localPushToken = await checkOrRequestPushAccess( )

	// Check if local push token is already registered remotely
	if( settings.pushTokens?.includes( localPushToken ) ) return false

	// Otherwise, return the token for handling
	return localPushToken

}