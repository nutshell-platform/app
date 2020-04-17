import * as Permissions from 'expo-permissions'
import * as SecureStore from 'expo-secure-store'
import { Notifications } from 'expo'

export const askForPushPermissions = async f => {

	const { status } = await Permissions.askAsync( Permissions.NOTIFICATIONS )
	if ( status != 'granted' ) throw 'Notification permissions not granted'

	const token = await Notifications.getExpoPushTokenAsync()
	if( !token ) throw 'Token generation failed'

	await SecureStore.setItemAsync( 'pushtoken', token, {
		keychainAccessible: SecureStore.ALWAYS
	} )

}

export const getPushToken = f => SecureStore.getItemAsync( 'pushtoken' )

export const savePushToken = async token => {
	// This is where you do logic to save your push token on your backend
}