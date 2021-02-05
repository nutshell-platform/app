import * as Notifications from 'expo-notifications'
import { checkOrRequestPushAccess } from './apis/permissions'
import { isWeb, isAndroid } from './apis/platform'
import { log } from './helpers'

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

export const registerNotificationListeners = history => {

	// Set andriod notification category
	if( isAndroid ) Notifications.setNotificationChannelAsync( 'default', {
		name: 'default',
		default: 'Notifications as configured in your settings.',
        sound: true,
        priority: 'max',
        vibrate: true
	} )

	Notifications.addNotificationResponseReceivedListener( ( { notification } ) => {

		log( notification )
		const { request: { content } } = notification

		// Check if data was sent with the notification
		const { data } = content

		// If the user tapped the notification and there is route info
		if( data?.goto ) history.push( data.goto )

	} )
}