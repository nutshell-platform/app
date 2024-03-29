// Permission APIs
import * as Permissions from 'expo-permissions'
import * as Notifications from 'expo-notifications'
import * as Contacts from 'expo-contacts'

// Device apis and helpers
import { log, catcher } from '../helpers'
import { isWeb, isIos } from './platform'

// ///////////////////////////////
// Push
// ///////////////////////////////
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

		// Request new token
		const { data: expoTokenBasedOnDeviceToken } = await Notifications.getExpoPushTokenAsync() || {}
		if( !expoTokenBasedOnDeviceToken ) throw 'Token generation failed'

		// Return the token
		return expoTokenBasedOnDeviceToken
		
	} catch( e ) {
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