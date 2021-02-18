// Permission APIs
import * as Permissions from 'expo-permissions'
import * as Notifications from 'expo-notifications'
import * as Contacts from 'expo-contacts'

// Device apis and helpers
import { log, catcher } from '../helpers'
import { isWeb, isIos } from './platform'
import Storage from './storage'

// ///////////////////////////////
// Push
// ///////////////////////////////
const getPushToken = f => Storage.getItemAsync( 'pushtoken' ).catch( f => undefined )
export const checkOrRequestPushAccess = async f => {

	try {
		
		// Check device permissions
		if( isIos ) {

			// Check permission status
			const permissions = await Permissions.askAsync( Permissions.NOTIFICATIONS )
			const { permissions: { notifications: noti } } = permissions

			if( !noti.ios.allowsAlert || !noti.ios.allowsBadge || !noti.ios.allowsSound ) throw { issue: 'Ios push permissions not granted', permissios: permissions }

			const { status } = await Permissions.askAsync( Permissions.USER_FACING_NOTIFICATIONS )
			if ( status != 'granted' ) throw 'Notification permissions not granted'

		} else {

			// Check permission status
			const { status } = await Permissions.askAsync( Permissions.NOTIFICATIONS )
			if ( status != 'granted' ) throw 'Notification permissions not granted'

		}

		// Check for token
		const oldToken = await getPushToken()
		if( oldToken ) return oldToken

		// Request new token
		const newToken = await Notifications.getExpoPushTokenAsync()
		if( !newToken ) throw 'Token generation failed'

		// Store new token
		await Storage.setItemAsync( 'pushtoken', newToken, isIos ? { keychainAccessible: Storage.ALWAYS } : {} )

		// Return the token
		return newToken
		
	} catch( e ) {
		log( `Token error ${JSON.stringify( e )}` )
		catcher( e )
	}

}

// ///////////////////////////////
// Camera
// ///////////////////////////////
// Check for camera permissions
export const checkCameraPermissions = f => {
	if( isWeb ) return Permissions.getAsync( Permissions.CAMERA ).then( ( { granted } ) => granted ).catch( f => false )
	else Permissions.getAsync( Permissions.CAMERA, Permissions.CAMERA_ROLL ).then( ( { granted } ) => granted ).catch( f => false )
}

// Check for and ask if needed
export const confirmOrAskCameraPermissions = async f => {
	if( isWeb ) return Permissions.askAsync( Permissions.CAMERA ).then( ( { granted } ) => granted ).catch( f => false )
	else return Permissions.askAsync( Permissions.CAMERA, Permissions.CAMERA_ROLL ).then( ( { granted } ) => granted ).catch( f => false )
}

// ///////////////////////////////
// Contacts
// ///////////////////////////////
export const confirmOrAskContactPermissions = async f => {

	try {

		const { status: oldStatus } = await Contacts.getPermissionsAsync()
		if( oldStatus == true ) return true

		const { status: newStatus } = await Contacts.requestPermissionsAsync()
		if( newStatus == true ) return true

		return false

	} catch( e ) {
		catcher( e )
		return false
	}

}