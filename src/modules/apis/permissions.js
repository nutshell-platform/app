import * as Permissions from 'expo-permissions'
import { Notifications } from 'expo'

// Device apis and helpers
import { log, catcher } from '../helpers'
import { isWeb, isIos } from './platform'
import Storage from './storage'

// ///////////////////////////////
// Push
// ///////////////////////////////
const getPushToken = f => Storage.getItemAsync( 'pushtoken' )
export const checkOrRequestPushAccess = async f => {

	try {
		
		// Check device permissions
		const { status } = await Permissions.askAsync( Permissions.NOTIFICATIONS )
		if ( status != 'granted' ) throw 'Notification permissions not granted'

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